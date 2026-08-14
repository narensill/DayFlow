using DayFlow.DTOs;
using DayFlow.Models;
using DayFlow.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DayFlow.Controllers;

[ApiController]
[Authorize]
[Route("api/reminders")]
public class RemindersController : ControllerBase
{
    private readonly IReminderService _reminderService;

    public RemindersController(IReminderService reminderService)
    {
        _reminderService = reminderService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Reminder>>> GetReminders(
        CancellationToken cancellationToken)
    {
        return Ok(
            await _reminderService.GetAllAsync(
                cancellationToken)
        );
    }

    [HttpGet("due")]
    public async Task<ActionResult<IEnumerable<Reminder>>> GetDueReminders(
        CancellationToken cancellationToken)
    {
        return Ok(
            await _reminderService.GetDueAsync(
                cancellationToken)
        );
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Reminder>> GetReminder(
        int id,
        CancellationToken cancellationToken)
    {
        var reminder = await _reminderService.GetByIdAsync(
            id,
            cancellationToken);

        if (reminder is null)
        {
            return NotFound(new
            {
                message = "Reminder not found."
            });
        }

        return Ok(reminder);
    }

    [HttpPost]
    public async Task<ActionResult<Reminder>> CreateReminder(
        CreateReminderRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var reminder = await _reminderService.CreateAsync(
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetReminder),
                new { id = reminder.Id },
                reminder);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Reminder>> UpdateReminder(
        int id,
        UpdateReminderRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var reminder = await _reminderService.UpdateAsync(
                id,
                request,
                cancellationToken);

            if (reminder is null)
            {
                return NotFound(new
                {
                    message = "Reminder not found."
                });
            }

            return Ok(reminder);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPatch("{id:int}/trigger")]
    public async Task<ActionResult<Reminder>> TriggerReminder(
        int id,
        CancellationToken cancellationToken)
    {
        var reminder = await _reminderService.TriggerAsync(
            id,
            cancellationToken);

        if (reminder is null)
        {
            return NotFound(new
            {
                message = "Reminder not found."
            });
        }

        return Ok(reminder);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteReminder(
        int id,
        CancellationToken cancellationToken)
    {
        var deleted = await _reminderService.DeleteAsync(
            id,
            cancellationToken);

        if (!deleted)
        {
            return NotFound(new
            {
                message = "Reminder not found."
            });
        }

        return NoContent();
    }
}
