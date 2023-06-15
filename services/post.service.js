import ApiError from './appError.js';
import PostModal from '../models/post.model.js';

class PostService {
  async createPost(body, user) {
    if (user.blocked) {
      throw new ApiError(403, 'Access denied, You account is blocked');
    }
    const newPost = await PostModal.create({ ...body, user: user._id });
    user.posts.push(newPost);
    await user.save();
    return newPost;
  }
}

export default new PostService();
