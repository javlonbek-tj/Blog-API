import postService from '../services/post.service.js';

class PostController {
  async createPost(req, res, next) {
    try {
      const { title, description } = req.body;
      const postBody = {
        title,
        description,
      };
      const newPost = await postService.createPost(postBody, req.user);
      return res.status(201).json({
        status: 'success',
        data: newPost,
      });
    } catch (e) {
      next(e);
    }
  }
}

export default new PostController();
