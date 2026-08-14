using DayFlow.DTOs;
using DayFlow.Models;
using DayFlow.Services;
using Microsoft.AspNetCore.Mvc;

namespace DayFlow.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;

    public EventsController(IEventService eventService)
    {
        _eventService = eventService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CalendarEvent>>> GetEvents(
        CancellationToken cancellationToken)
    {
        return Ok(
            await _eventService.GetAllAsync(cancellationToken)
        );
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CalendarEvent>> GetEvent(
        int id,
        CancellationToken cancellationToken)
    {
        var calendarEvent = await _eventService.GetByIdAsync(
            id,
            cancellationToken
        );

        if (calendarEvent is null)
        {
            return NotFound(new
            {
                message = "Event not found."
            });
        }

        return Ok(calendarEvent);
    }

    [HttpGet("date/{date}")]
    public async Task<ActionResult<IEnumerable<CalendarEvent>>> GetByDate(
        DateTime date,
        CancellationToken cancellationToken)
    {
        return Ok(
            await _eventService.GetByDateAsync(
                date,
                cancellationToken)
        );
    }

    [HttpGet("upcoming")]
    public async Task<ActionResult<IEnumerable<CalendarEvent>>> GetUpcoming(
        [FromQuery] int days = 7,
        CancellationToken cancellationToken = default)
    {
        return Ok(
            await _eventService.GetUpcomingAsync(
                days,
                cancellationToken)
        );
    }

    [HttpPost]
    public async Task<ActionResult<CalendarEvent>> CreateEvent(
        CreateEventRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new
            {
                message = "Event title is required."
            });
        }

        if (request.Title.Trim().Length > 200)
        {
            return BadRequest(new
            {
                message = "Event title cannot exceed 200 characters."
            });
        }

        if (request.Description?.Length > 2000)
        {
            return BadRequest(new
            {
                message = "Event description cannot exceed 2000 characters."
            });
        }

        try
        {
            var calendarEvent = await _eventService.CreateAsync(
                request,
                cancellationToken
            );

            return CreatedAtAction(
                nameof(GetEvent),
                new { id = calendarEvent.Id },
                calendarEvent
            );
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
    public async Task<ActionResult<CalendarEvent>> UpdateEvent(
        int id,
        UpdateEventRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new
            {
                message = "Event title is required."
            });
        }

        if (request.Title.Trim().Length > 200)
        {
            return BadRequest(new
            {
                message = "Event title cannot exceed 200 characters."
            });
        }

        if (request.Description?.Length > 2000)
        {
            return BadRequest(new
            {
                message = "Event description cannot exceed 2000 characters."
            });
        }

        try
        {
            var calendarEvent = await _eventService.UpdateAsync(
                id,
                request,
                cancellationToken
            );

            if (calendarEvent is null)
            {
                return NotFound(new
                {
                    message = "Event not found."
                });
            }

            return Ok(calendarEvent);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteEvent(
        int id,
        CancellationToken cancellationToken)
    {
        var deleted = await _eventService.DeleteAsync(
            id,
            cancellationToken
        );

        if (!deleted)
        {
            return NotFound(new
            {
                message = "Event not found."
            });
        }

        return NoContent();
    }
}
