export const genres: string[] = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Thriller",
];

export function slugToGenre(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .replace(/^Science fiction$/, "Science Fiction");
}

export function genreToSlug(genre: string): string {
  return genre.toLowerCase().replace(/\s+/g, "-");
}
