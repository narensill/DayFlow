using DayFlow.DTOs;
using DayFlow.Models;
using DayFlow.Services;
using Microsoft.AspNetCore.Mvc;

namespace DayFlow.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks(
        [FromQuery] TaskQueryParameters query,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(
                await _taskService.GetAllAsync(
                    query,
                    cancellationToken)
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

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskItem>> GetTask(
        int id,
        CancellationToken cancellationToken)
    {
        var task = await _taskService.GetByIdAsync(
            id,
            cancellationToken
        );

        if (task is null)
        {
            return NotFound(new
            {
                message = "Task not found."
            });
        }

        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask(
        CreateTaskRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new
            {
                message = "Task title is required."
            });
        }

        if (request.Title.Trim().Length > 200)
        {
            return BadRequest(new
            {
                message = "Task title cannot exceed 200 characters."
            });
        }

        if (request.Description?.Length > 1000)
        {
            return BadRequest(new
            {
                message = "Task description cannot exceed 1000 characters."
            });
        }

        try
        {
            var task = await _taskService.CreateAsync(
                request,
                cancellationToken
            );

            return CreatedAtAction(
                nameof(GetTask),
                new { id = task.Id },
                task
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
    public async Task<ActionResult<TaskItem>> UpdateTask(
        int id,
        UpdateTaskRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new
            {
                message = "Task title is required."
            });
        }

        if (request.Title.Trim().Length > 200)
        {
            return BadRequest(new
            {
                message = "Task title cannot exceed 200 characters."
            });
        }

        if (request.Description?.Length > 1000)
        {
            return BadRequest(new
            {
                message = "Task description cannot exceed 1000 characters."
            });
        }

        try
        {
            var task = await _taskService.UpdateAsync(
                id,
                request,
                cancellationToken
            );

            if (task is null)
            {
                return NotFound(new
                {
                    message = "Task not found."
                });
            }

            return Ok(task);
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
    public async Task<IActionResult> DeleteTask(
        int id,
        CancellationToken cancellationToken)
    {
        var deleted = await _taskService.DeleteAsync(
            id,
            cancellationToken
        );

        if (!deleted)
        {
            return NotFound(new
            {
                message = "Task not found."
            });
        }

        return NoContent();
    }

    [HttpPatch("{id:int}/complete")]
    public async Task<ActionResult<TaskItem>> CompleteTask(
        int id,
        CancellationToken cancellationToken)
    {
        var task = await _taskService.CompleteAsync(
            id,
            cancellationToken
        );

        if (task is null)
        {
            return NotFound(new
            {
                message = "Task not found."
            });
        }

        return Ok(task);
    }
}
