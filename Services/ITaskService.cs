using DayFlow.DTOs;
using DayFlow.Models;

namespace DayFlow.Services;

public interface ITaskService
{
    Task<List<TaskItem>> GetAllAsync(
        TaskQueryParameters query,
        CancellationToken cancellationToken = default);

    Task<TaskItem?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<TaskItem> CreateAsync(
        CreateTaskRequest request,
        CancellationToken cancellationToken = default);

    Task<TaskItem?> UpdateAsync(
        int id,
        UpdateTaskRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<TaskItem?> CompleteAsync(
        int id,
        CancellationToken cancellationToken = default);
}
