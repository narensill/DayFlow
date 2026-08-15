using DayFlow.DTOs;
using DayFlow.Models;
using DayFlow.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DayFlow.Controllers;

[ApiController]
[Authorize]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories(
        CancellationToken cancellationToken)
    {
        return Ok(
            await _categoryService.GetAllAsync(cancellationToken)
        );
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Category>> GetCategory(
        int id,
        CancellationToken cancellationToken)
    {
        var category = await _categoryService.GetByIdAsync(
            id,
            cancellationToken
        );

        if (category is null)
        {
            return NotFound(new
            {
                message = "Category not found."
            });
        }

        return Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(
        CreateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new
            {
                message = "Category name is required."
            });
        }

        if (request.Name.Trim().Length > 100)
        {
            return BadRequest(new
            {
                message = "Category name cannot exceed 100 characters."
            });
        }

        try
        {
            var category = await _categoryService.CreateAsync(
                request,
                cancellationToken
            );

            return CreatedAtAction(
                nameof(GetCategory),
                new { id = category.Id },
                category
            );
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Category>> UpdateCategory(
        int id,
        UpdateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new
            {
                message = "Category name is required."
            });
        }

        if (request.Name.Trim().Length > 100)
        {
            return BadRequest(new
            {
                message = "Category name cannot exceed 100 characters."
            });
        }

        try
        {
            var category = await _categoryService.UpdateAsync(
                id,
                request,
                cancellationToken
            );

            if (category is null)
            {
                return NotFound(new
                {
                    message = "Category not found."
                });
            }

            return Ok(category);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategory(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            var deleted = await _categoryService.DeleteAsync(
                id,
                cancellationToken
            );

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Category not found."
                });
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }
}
