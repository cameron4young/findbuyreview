import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface SaveCollectionDoc extends BaseDoc {
  user: ObjectId;
  name: string;
  posts: ObjectId[];
}

/**
 * debugged by ChatGPT :)
 * concept: Saving [User, Post]
 */
export default class SavingConcept {
  public readonly collections: DocCollection<SaveCollectionDoc>;

  /**
   * Make an instance of Saving.
   */
  constructor(collectionName: string) {
    this.collections = new DocCollection<SaveCollectionDoc>(collectionName);
  }

  async createCollection(user: ObjectId, name: string) {
    const _id = await this.collections.createOne({ user, name, posts: [] });
    return { msg: "Collection successfully created!", collection: await this.collections.readOne({ _id }) };
  }

  async savePostToCollection(user: ObjectId, collectionId: ObjectId, postId: ObjectId) {
    const collection = await this.collections.readOne({ _id: collectionId });
    if (!collection) {
      throw new NotFoundError(`Collection ${collectionId} does not exist!`);
    }
    if (collection.user.toString() !== user.toString()) {
      throw new NotAllowedError("You do not have permission to save posts to this collection.");
    }
    if (!collection.posts.includes(postId)) {
      collection.posts.push(postId);
      await this.collections.partialUpdateOne({ _id: collectionId }, { posts: collection.posts });
    }
    return { msg: "Post successfully saved to collection!" };
  }

  async removePostFromCollection(user: ObjectId, collectionId: ObjectId, postId: ObjectId) {
    const collection = await this.collections.readOne({ _id: collectionId });
    if (!collection) {
      throw new NotFoundError(`Collection ${collectionId} does not exist!`);
    }
    if (collection.user.toString() !== user.toString()) {
      throw new NotAllowedError("You do not have permission to remove posts from this collection.");
    }
    const updatedPosts = collection.posts.filter((p) => p.toString() !== postId.toString());
    await this.collections.partialUpdateOne({ _id: collectionId }, { posts: updatedPosts });
    return { msg: "Post successfully removed from collection!" };
  }

  async getCollectionByName(user: ObjectId, name: string): Promise<ObjectId | null> {
    const collection = await this.collections.readOne({ user, name });
    if (!collection) {
      throw new NotFoundError(`Collection with name '${name}' not found for this user.`);
    }
    return collection._id;
  }

  async getPostsInCollection(user: ObjectId, collectionId: ObjectId) {
    const collection = await this.collections.readOne({ _id: collectionId });
    if (!collection) {
      throw new NotFoundError(`Collection ${collectionId} does not exist!`);
    }
    if (collection.user.toString() !== user.toString()) {
      throw new NotAllowedError("You do not have permission to view posts in this collection.");
    }
    if (!collection) {
      throw new NotFoundError(`Collection ${collectionId} does not exist!`);
    }
    return collection.posts;
  }

  async deleteCollection(user: ObjectId, collectionId: ObjectId) {
    const collection = await this.collections.readOne({ _id: collectionId });
    if (!collection) {
      throw new NotFoundError(`Collection ${collectionId} does not exist!`);
    }
    if (collection.user.toString() !== user.toString()) {
      throw new NotAllowedError("You do not have permission to delete this collection.");
    }
    await this.collections.deleteOne({ _id: collectionId });
    return { msg: "Collection deleted successfully!" };
  }

  async getAllCollectionNames(): Promise<string[]> {
    const collections = await this.collections.readMany({});
    return collections.map((collection) => collection.name);
  }
}
