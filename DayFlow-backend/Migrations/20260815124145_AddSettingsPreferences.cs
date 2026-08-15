using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DayFlow.Migrations
{
    /// <inheritdoc />
    public partial class AddSettingsPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.AddColumn<bool>(
        name: "AnimationsEnabled",
        table: "UserSettings",
        type: "boolean",
        nullable: false,
        defaultValue: true);

    migrationBuilder.AddColumn<bool>(
        name: "BrowserNotificationsEnabled",
        table: "UserSettings",
        type: "boolean",
        nullable: false,
        defaultValue: true);

    migrationBuilder.AddColumn<bool>(
        name: "CompactMode",
        table: "UserSettings",
        type: "boolean",
        nullable: false,
        defaultValue: false);

    migrationBuilder.AddColumn<string>(
        name: "DefaultTaskPriority",
        table: "UserSettings",
        type: "text",
        nullable: false,
        defaultValue: "Medium");

    migrationBuilder.AddColumn<string>(
        name: "DefaultTaskStatus",
        table: "UserSettings",
        type: "text",
        nullable: false,
        defaultValue: "Pending");

    migrationBuilder.AddColumn<string>(
        name: "WeekStartsOn",
        table: "UserSettings",
        type: "text",
        nullable: false,
        defaultValue: "sunday");
}

protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.DropColumn(name: "AnimationsEnabled", table: "UserSettings");
    migrationBuilder.DropColumn(name: "BrowserNotificationsEnabled", table: "UserSettings");
    migrationBuilder.DropColumn(name: "CompactMode", table: "UserSettings");
    migrationBuilder.DropColumn(name: "DefaultTaskPriority", table: "UserSettings");
    migrationBuilder.DropColumn(name: "DefaultTaskStatus", table: "UserSettings");
    migrationBuilder.DropColumn(name: "WeekStartsOn", table: "UserSettings");
}
    }
}
