using DayFlow.Data;
using DayFlow.DTOs;
using DayFlow.Models;
using Microsoft.EntityFrameworkCore;

namespace DayFlow.Services;

public class TaskService : ITaskService
{
    private readonly DayFlowDbContext _context;

    public TaskService(DayFlowDbContext context)
    {
        _context = context;
    }

    public async Task<List<TaskItem>> GetAllAsync(
        TaskQueryParameters query,
        CancellationToken cancellationToken = default)
    {
        IQueryable<TaskItem> tasks = _context.TaskItems
            .Include(task => task.Category);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();

            tasks = tasks.Where(task =>
                task.Title.ToLower().Contains(search) ||
                (task.Description != null &&
                 task.Description.ToLower().Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            if (!Enum.TryParse<DayFlow.Models.TaskStatus>(
                    query.Status,
                    true,
                    out var status))
            {
                throw new ArgumentException(
                    "Invalid status. Use Pending, InProgress, Completed, or Cancelled.");
            }

            tasks = tasks.Where(task => task.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(query.Priority))
        {
            if (!Enum.TryParse<TaskPriority>(
                    query.Priority,
                    true,
                    out var priority))
            {
                throw new ArgumentException(
                    "Invalid priority. Use Low, Medium, or High.");
            }

            tasks = tasks.Where(task => task.Priority == priority);
        }

        if (query.CategoryId.HasValue)
        {
            tasks = tasks.Where(task =>
                task.CategoryId == query.CategoryId.Value);
        }

        if (query.Overdue.HasValue)
        {
            var now = DateTime.UtcNow;

            if (query.Overdue.Value)
            {
                tasks = tasks.Where(task =>
                    task.DueDate.HasValue &&
                    task.DueDate.Value < now &&
                    task.Status != DayFlow.Models.TaskStatus.Completed &&
                    task.Status != DayFlow.Models.TaskStatus.Cancelled);
            }
            else
            {
                tasks = tasks.Where(task =>
                    !task.DueDate.HasValue ||
                    task.DueDate.Value >= now ||
                    task.Status == DayFlow.Models.TaskStatus.Completed ||
                    task.Status == DayFlow.Models.TaskStatus.Cancelled);
            }
        }

        tasks = query.Sort.ToLower() switch
        {
            "duedate" or "due" =>
                tasks.OrderBy(task => task.DueDate),

            "duedatedesc" or "due-desc" =>
                tasks.OrderByDescending(task => task.DueDate),

            "priority" =>
                tasks.OrderByDescending(task => task.Priority),

            "priorityasc" or "priority-asc" =>
                tasks.OrderBy(task => task.Priority),

            "createdat" or "created" =>
                tasks.OrderByDescending(task => task.CreatedAt),

            "createdasc" or "created-asc" =>
                tasks.OrderBy(task => task.CreatedAt),

            "title" =>
                tasks.OrderBy(task => task.Title),

            "titledesc" or "title-desc" =>
                tasks.OrderByDescending(task => task.Title),

            _ => throw new ArgumentException(
                "Invalid sort. Use dueDate, dueDateDesc, priority, priorityAsc, createdAt, createdAsc, title, or titleDesc.")
        };

        return await tasks.ToListAsync(cancellationToken);
    }

    public async Task<TaskItem?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context.TaskItems
            .Include(task => task.Category)
            .FirstOrDefaultAsync(
                task => task.Id == id,
                cancellationToken);
    }

    public async Task<TaskItem> CreateAsync(
        CreateTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!await _context.Categories.AnyAsync(
                c => c.Id == request.CategoryId,
                cancellationToken))
        {
            throw new ArgumentException("Invalid category.");
        }

        var now = DateTime.UtcNow;

        var task = new TaskItem
        {
            Title = request.Title.Trim(),
            Description = request.Description,
            DueDate = request.DueDate,
            Priority = request.Priority,
            Status = request.Status,
            CategoryId = request.CategoryId,
            IsCompleted =
                request.Status == DayFlow.Models.TaskStatus.Completed,
            CreatedAt = now,
            UpdatedAt = now,
            CompletedAt =
                request.Status == DayFlow.Models.TaskStatus.Completed
                    ? now
                    : null
        };

        _context.TaskItems.Add(task);

        await _context.SaveChangesAsync(cancellationToken);

        await _context.Entry(task)
            .Reference(t => t.Category)
            .LoadAsync(cancellationToken);

        return task;
    }

    public async Task<TaskItem?> UpdateAsync(
        int id,
        UpdateTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        var task = await _context.TaskItems
            .FindAsync([id], cancellationToken);

        if (task is null)
            return null;

        if (!await _context.Categories.AnyAsync(
                c => c.Id == request.CategoryId,
                cancellationToken))
        {
            throw new ArgumentException("Invalid category.");
        }

        task.Title = request.Title.Trim();
        task.Description = request.Description;
        task.DueDate = request.DueDate;
        task.Priority = request.Priority;
        task.Status = request.Status;
        task.CategoryId = request.CategoryId;
        task.UpdatedAt = DateTime.UtcNow;

        if (request.Status == DayFlow.Models.TaskStatus.Completed)
        {
            task.IsCompleted = true;
            task.CompletedAt ??= DateTime.UtcNow;
        }
        else
        {
            task.IsCompleted = false;
            task.CompletedAt = null;
        }

        await _context.SaveChangesAsync(cancellationToken);

        await _context.Entry(task)
            .Reference(t => t.Category)
            .LoadAsync(cancellationToken);

        return task;
    }

    public async Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var task = await _context.TaskItems
            .FindAsync([id], cancellationToken);

        if (task is null)
            return false;

        _context.TaskItems.Remove(task);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<TaskItem?> CompleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var task = await _context.TaskItems
            .FindAsync([id], cancellationToken);

        if (task is null)
            return null;

        task.Status = DayFlow.Models.TaskStatus.Completed;
        task.IsCompleted = true;
        task.CompletedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        await _context.Entry(task)
            .Reference(t => t.Category)
            .LoadAsync(cancellationToken);

        return task;
    }
}
