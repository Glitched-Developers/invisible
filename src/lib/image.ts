export async function compressImage(file: File, maxSizeMB = 0.5): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const image = new Image();
      image.src = event.target?.result as string;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        let width = image.width;
        let height = image.height;
        const maxDimension = 512;

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context?.drawImage(image, 0, 0, width, height);

        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        if (compressed.length > maxSizeMB * 1024 * 1024) {
          reject(new Error("Avatar is too large after compression"));
        } else {
          resolve(compressed);
        }
      };
      image.onerror = reject;
    };
    reader.onerror = reject;
  });
}
