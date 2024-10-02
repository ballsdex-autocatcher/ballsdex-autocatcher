import os as _os
from multiprocessing import Pool
from typing import Sequence, Optional

import numpy as _np
from PIL import Image as _Image


def load_images(folder_path: str):
    images = []
    for filename in _os.listdir(folder_path):
        if filename.endswith(('.png', '.jpg', '.jpeg')):
            img_path = _os.path.join(folder_path, filename)
            images.append((filename, _Image.open(img_path).convert('RGBA')))
    return images

def preprocess_image(image: str, resize_shape: Sequence[int] = (15,15)):
    image = image.resize(resize_shape, _Image.Resampling.LANCZOS)
    image_array = _np.array(image)
    mask = image_array[:, :, 3] > 0
    return image_array[:, :, :3], mask

def mse(image1, image2, mask):
    diff = (image1 - image2) ** 2
    mse_value = _np.sum(diff[mask]) / _np.sum(mask)
    return mse_value

def compare_images(target_image: str, target_mask, images: Sequence[str]):
    def process_image(image_tuple):
        filename, image = image_tuple
        preprocessed_image, mask = preprocess_image(image)
        if preprocessed_image.shape == target_image.shape:
            combined_mask = target_mask & mask
            current_mse = mse(target_image, preprocessed_image, combined_mask)
            return current_mse, filename
        return float('inf'), filename

    with Pool() as pool:
        results = pool.map(process_image, images)
    
    most_similar_image = min(results, key=lambda x: x[0])
    return most_similar_image[1]


def compare(
        target_image_path: str,
        folder_path: str
) -> Optional[str]:


    target_image = _Image.open(target_image_path).convert('RGBA')
    preprocessed_target_image, target_mask = preprocess_image(target_image)
    images = load_images(folder_path)
    most_similar_image = compare_images(preprocessed_target_image, target_mask, images)
    return most_similar_image