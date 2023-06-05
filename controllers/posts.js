import Post from "../models/Post.js";
import User from "../models/User.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// Create Post
export const createPost = async (req, res) => {
  console.log(req, res);
  try {
    const { title, text } = req.body;
    const user = await User.findById(req.userId);

    if (req.files) {
      let fileName = Date.now().toString() + req.files.image.name; // Here we give a name to image
      const __dirname = dirname(fileURLToPath(import.meta.url)); // with this we can get folder where we are now
      req.files.image.mv(path.join(__dirname, "..", "uploads", fileName)); // with function 'mv' we are moving picture to uploads folder

      const newPostWithImage = new Post({
        username: user.username,
        title,
        text,
        imgUrl: fileName,
        author: req.userId,
      });

      await newPostWithImage.save(); // Here we are saving created post in DB
      await User.findByIdAndUpdate(req.userId, {
        // Here we are finding user where we made post and upload (push) it to it Schema
        $push: { posts: newPostWithImage },
      });

      return res.json(newPostWithImage);
    }

    const newPostWithoutImg = new Post({
      username: user.username,
      title,
      text,
      imgUrl: "",
      author: req.userId,
    });

    await newPostWithoutImg.save();
    await User.findByIdAndUpdate(req.userId, {
      $push: { posts: newPostWithoutImg },
    });

    return res.json(newPostWithoutImg);
  } catch (e) {
    res.json({ message: "Something went wrong" });
  }
};