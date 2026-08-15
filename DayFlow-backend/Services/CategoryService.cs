using DayFlow.Data;
using DayFlow.DTOs;
using DayFlow.Models;
using Microsoft.EntityFrameworkCore;

namespace DayFlow.Services;

public class CategoryService : ICategoryService
{
    private readonly DayFlowDbContext _context;

    public CategoryService(DayFlowDbContext context)
    {
        _context = context;
    }

    public async Task<List<Category>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .OrderBy(category => category.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Category?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .FindAsync([id], cancellationToken);
    }

    public async Task<Category> CreateAsync(
        CreateCategoryRequest request,
        CancellationToken cancellationToken = default)
    {
        var name = request.Name.Trim();

        var exists = await _context.Categories
            .AnyAsync(
                category => category.Name.ToLower() == name.ToLower(),
                cancellationToken);

        if (exists)
            throw new InvalidOperationException("A category with this name already exists.");

        var category = new Category
        {
            Name = name,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);

        await _context.SaveChangesAsync(cancellationToken);

        return category;
    }

    public async Task<Category?> UpdateAsync(
        int id,
        UpdateCategoryRequest request,
        CancellationToken cancellationToken = default)
    {
        var category = await _context.Categories
            .FindAsync([id], cancellationToken);

        if (category is null)
            return null;

        var name = request.Name.Trim();

        var duplicate = await _context.Categories
            .AnyAsync(
                existing =>
                    existing.Id != id &&
                    existing.Name.ToLower() == name.ToLower(),
                cancellationToken);

        if (duplicate)
            throw new InvalidOperationException(
                "A category with this name already exists.");

        category.Name = name;

        await _context.SaveChangesAsync(cancellationToken);

        return category;
    }

    public async Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var category = await _context.Categories
            .FindAsync([id], cancellationToken);

        if (category is null)
            return false;

        var hasTasks = await _context.TaskItems
            .AnyAsync(
                task => task.CategoryId == id,
                cancellationToken);

        if (hasTasks)
        {
            throw new InvalidOperationException(
                "Cannot delete a category that is assigned to tasks.");
        }

        _context.Categories.Remove(category);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
