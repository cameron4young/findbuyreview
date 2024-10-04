import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface LabelDoc extends BaseDoc {
  label: string;
  posts: ObjectId[];
}

/**
 * concept: Labeling [Label -> Posts]
 */
export default class LabelingConcept {
  public readonly labels: DocCollection<LabelDoc>;

  /**
   * Make an instance of Labeling.
   */
  constructor(collectionName: string) {
    this.labels = new DocCollection<LabelDoc>(collectionName);
  }

  async addLabelToPost(label: string, postId: ObjectId) {
    let labelDoc = await this.labels.readOne({ label });
    if (!labelDoc) {
      // Create a new label document if it doesn't exist
      await this.labels.createOne({ label, posts: [postId] });
    } else {
      // Add post to existing label's posts if not already present
      if (!labelDoc.posts.includes(postId)) {
        labelDoc.posts.push(postId);
        await this.labels.partialUpdateOne({ _id: labelDoc._id }, { posts: labelDoc.posts });
      }
    }
    return { msg: `Post successfully labeled with ${label}!` };
  }

  async removeLabelFromPost(label: string, postId: ObjectId) {
    const labelDoc = await this.labels.readOne({ label });
    if (!labelDoc) {
      throw new NotFoundError(`Label '${label}' not found.`);
    }
    const updatedPosts = labelDoc.posts.filter((existingPostId) => existingPostId.toString() !== postId.toString());
    await this.labels.partialUpdateOne({ _id: labelDoc._id }, { posts: updatedPosts });
    return { msg: `Post successfully removed from label ${label}!` };
  }

  async getPostsByLabel(label: string): Promise<ObjectId[]> {
    const labelDoc = await this.labels.readOne({ label });
    if (!labelDoc) {
      throw new NotFoundError(`Label '${label}' not found.`);
    }
    return labelDoc.posts;
  }
}
