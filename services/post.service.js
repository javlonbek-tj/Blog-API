import ApiError from './appError.js';
import postModal from '../models/post.model.js';

class PostService {
  async createPost(body, user) {
    if (!user) {
      throw ApiError.BadRequest('User not Found');
    }
    const newPost = await postModal.create({ ...body, user: user._id });
    user.posts.push(newPost);
    await user.save();
    return newPost;
  }
}

export default new PostService();
