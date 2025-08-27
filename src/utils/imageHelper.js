//Helper for clean image URL
export const cleanImageUrl = (base, imagePath) => {
    base.replace(/\/$/, "") + "/" + imagePath.replace(/^\//, "");
}