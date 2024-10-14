import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface UserPreferenceDoc extends BaseDoc {
  userId: ObjectId;
  interests: String[];
  age: number;
  location: string;
  lookingFor: string;
  favoriteCompanies: String[];
  doNotShow: String[];
}

export default class PreferencesConcept {
  public readonly preferences: DocCollection<UserPreferenceDoc>;

  constructor(collectionName: string) {
    this.preferences = new DocCollection<UserPreferenceDoc>(collectionName);
  }

  async createUserPreferenceDoc(
    userId: ObjectId,
    interests: String[] = [],
    age: number = -1,
    location: string = "",
    lookingFor: string = "",
    favoriteCompanies: String[] = [],
    doNotShow: String[] = [],
  ) {
    const existingPreferences = await this.preferences.readOne({ userId: userId });
    console.log(userId, interests, age, location, lookingFor, favoriteCompanies, doNotShow);
    if (existingPreferences) {
      throw new Error("User already has preferences.");
    }
    await this.preferences.createOne({
      _id: userId,
      userId,
      interests,
      age,
      location,
      lookingFor,
      favoriteCompanies,
      doNotShow,
    });
    return {
      message: "Profile successfully created",
    };
  }

  async addInterest(userId: ObjectId, interest: string) {
    const userPreferences = await this.preferences.readOne({ userId: userId });
    if (userPreferences) {
      let newArray = userPreferences.favoriteCompanies.concat(interest);
      await this.preferences.partialUpdateOne({ userId: userId }, { interests: newArray });
    }
  }

  async addFavoriteCompany(userId: ObjectId, company: string) {
    const userPreferences = await this.preferences.readOne({ userId: userId });
    if (userPreferences) {
      let newArray = userPreferences.favoriteCompanies.concat(company);
      await this.preferences.partialUpdateOne({ userId: userId }, { favoriteCompanies: newArray });
    }
  }

  async blockContent(userId: ObjectId, block: string) {
    const userPreferences = await this.preferences.readOne({ userId: userId });
    if (userPreferences) {
      let newArray = userPreferences.doNotShow.concat(block);
      if (block in userPreferences.interests) {
        let index = userPreferences.interests.indexOf(block);
        userPreferences.interests.splice(index, 1);
      }
      await this.preferences.partialUpdateOne({ userId: userId }, { doNotShow: newArray });
    }
  }

  async updateLocation(userId: ObjectId, newLocation: string) {
    await this.preferences.partialUpdateOne({ userId: userId }, { location: newLocation });
  }

  async updateAge(userId: ObjectId, newAge: number) {
    await this.preferences.partialUpdateOne({ userId: userId }, { age: newAge });
  }

  async updateLookingFor(userId: ObjectId, newLookingFor: string) {
    await this.preferences.partialUpdateOne({ userId: userId }, { lookingFor: newLookingFor });
  }

  async getPreferences(userId: ObjectId): Promise<UserPreferenceDoc | null> {
    return await this.preferences.readOne({ userId: userId });
  }
}
