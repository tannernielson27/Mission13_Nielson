using BookStore.API.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var dbPath = Path.Combine(builder.Environment.ContentRootPath, "Bookstore.sqlite");
Console.WriteLine($"[DB] ContentRootPath: {builder.Environment.ContentRootPath}");
Console.WriteLine($"[DB] SQLite path: {dbPath}");
Console.WriteLine($"[DB] File exists: {File.Exists(dbPath)}");
builder.Services.AddDbContext<BookDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.MapGet("/api/health", () => new {
    status = "ok",
    dbPath = Path.Combine(app.Environment.ContentRootPath, "Bookstore.sqlite"),
    dbExists = File.Exists(Path.Combine(app.Environment.ContentRootPath, "Bookstore.sqlite"))
});

app.Run();
