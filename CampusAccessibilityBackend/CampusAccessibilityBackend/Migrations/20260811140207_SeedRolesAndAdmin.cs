using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CampusAccessibilityBackend.Migrations
{
    /// <inheritdoc />
    public partial class SeedRolesAndAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "DeletedAt", "Email", "Firstname", "InsertedAt", "IsDeleted", "Lastname", "ModifiedAt", "Password", "RoleId" },
                values: new object[] { 1, null, "admin@campusaccessibility.local", "Admin", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, "Admin", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "$2b$12$cT8Uhmj7KrJwXxNcoxpgnenbp54G5yZTsOGHjdz.Kvu56TOnMVv0W", 1 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);
        }
    }
}
