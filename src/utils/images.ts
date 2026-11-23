const images = import.meta.glob(
  "/src/assets/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    import: "default",
  }
);

export const getProductImage = (photoId: string) => {
  const imagePath = `/src/assets/${photoId}.jpg`;

  return images[imagePath] as string;
};