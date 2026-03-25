using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.API.Data;

public class Book
{
    [Key]
    [Column("BookID")]
    public int BookId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Publisher { get; set; } = string.Empty;
    [Column("ISBN")]
    public string Isbn { get; set; } = string.Empty;
    public string Classification { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    [Column("PageCount")]
    public int NumPages { get; set; }
    public double Price { get; set; }
}
