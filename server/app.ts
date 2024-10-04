import AuthenticatingConcept from "./concepts/authenticating";
import FriendingConcept from "./concepts/friending";
import LabelingConcept from "./concepts/label";
import PostingConcept from "./concepts/posting";
import SavingConcept from "./concepts/saving";
import SessioningConcept from "./concepts/sessioning";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Posting = new PostingConcept("posts");
export const Friending = new FriendingConcept("friends");
export const Saving = new SavingConcept("posts");
export const Labeling = new LabelingConcept("posts");
