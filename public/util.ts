type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type InputTag = "input" | "textarea" | "json";
type Field = InputTag | { [key: string]: Field };
type Fields = Record<string, Field>;

type Operation = {
  name: string;
  endpoint: string;
  method: HttpMethod;
  fields: Fields;
};

/**
 * This list of operations is used to generate the manual testing UI.
 */
const operations: Operation[] = [
  {
    name: "Get Session User (logged in user)",
    endpoint: "/api/session",
    method: "GET",
    fields: {},
  },
  {
    name: "Create User",
    endpoint: "/api/users",
    method: "POST",
    fields: { username: "input", password: "input" },
  },
  {
    name: "Login",
    endpoint: "/api/login",
    method: "POST",
    fields: { username: "input", password: "input" },
  },
  {
    name: "Logout",
    endpoint: "/api/logout",
    method: "POST",
    fields: {},
  },
  {
    name: "Update Password",
    endpoint: "/api/users/password",
    method: "PATCH",
    fields: { currentPassword: "input", newPassword: "input" },
  },
  {
    name: "Delete User",
    endpoint: "/api/users",
    method: "DELETE",
    fields: {},
  },
  {
    name: "Get Users (empty for all)",
    endpoint: "/api/users/:username",
    method: "GET",
    fields: { username: "input" },
  },
  {
    name: "Get Posts (empty for all)",
    endpoint: "/api/posts",
    method: "GET",
    fields: { author: "input" },
  },
  {
    name: "Create Post",
    endpoint: "/api/posts",
    method: "POST",
    fields: { content: "input", video: "input", rating: "input", productURL: "input" },
  },
  {
    name: "Update Post",
    endpoint: "/api/posts/:id",
    method: "PATCH",
    fields: { id: "input", content: "input", rating: "input", productURL: "input", options: { backgroundColor: "input" } },
  },
  {
    name: "Delete Post",
    endpoint: "/api/posts/:id",
    method: "DELETE",
    fields: { id: "input" },
  },
  {
    name: "Create Collection",
    endpoint: "/api/collection",
    method: "POST",
    fields: { collectionName: "input" },
  },
  {
    name: "Delete Collection",
    endpoint: "/api/collection",
    method: "DELETE",
    fields: { collectionName: "input" },
  },
  {
    name: "Get All Collections",
    endpoint: "/api/collection",
    method: "GET",
    fields: {},
  },
  {
    name: "Get Collections by User",
    endpoint: "/api/collections/user/:userId",
    method: "GET",
    fields: { userId: "input" },
  },
  {
    name: "Get All Posts In Collection",
    endpoint: "/api/collection/:collectionName",
    method: "GET",
    fields: { collectionName: "input" },
  },
  {
    name: "Save Post To Collection",
    endpoint: "/api/save",
    method: "POST",
    fields: { collectionName: "input", id: "input" },
  },
  {
    name: "Delete Post From Collection",
    endpoint: "/api/save",
    method: "DELETE",
    fields: { collectionName: "input", id: "input" },
  },
  {
    name: "Add Label to Post",
    endpoint: "/api/label",
    method: "POST",
    fields: { postId: "input", label: "input" },
  },
  {
    name: "Remove Label from Post",
    endpoint: "/api/label",
    method: "DELETE",
    fields: { postId: "input", label: "input" },
  },
  {
    name: "Get Posts by Label",
    endpoint: "/api/label/:label",
    method: "GET",
    fields: { label: "input" },
  },
  {
    name: "Create User Preferences",
    endpoint: "/api/preferences",
    method: "POST",
    fields: { userId: "input", interests: "input", age: "input", location: "input", lookingFor: "input", favoriteCompanies: "input", doNotShow: "input" },
  },
  {
    name: "Add Interest",
    endpoint: "/api/preferences/:userId/interests",
    method: "POST",
    fields: { userId: "input", interest: "input" },
  },
  {
    name: "Add Favorite Company",
    endpoint: "/api/preferences/:userId/favorite-companies",
    method: "POST",
    fields: { userId: "input", company: "input" },
  },
  {
    name: "Block Content",
    endpoint: "/api/preferences/:userId/blocked",
    method: "POST",
    fields: { userId: "input", block: "input" },
  },
  {
    name: "Update Location",
    endpoint: "/api/preferences/:userId/location",
    method: "PATCH",
    fields: { userId: "input", newLocation: "input" },
  },
  {
    name: "Update Age",
    endpoint: "/api/preferences/:userId/age",
    method: "PATCH",
    fields: { userId: "input", newAge: "input" },
  },
  {
    name: "Update Looking For",
    endpoint: "/api/preferences/:userId/looking-for",
    method: "PATCH",
    fields: { userId: "input", newLookingFor: "input" },
  },
  {
    name: "Get Preferences",
    endpoint: "/api/preferences/:userId",
    method: "GET",
    fields: { userId: "input" },
  },
  {
    name: "Create Conversation",
    endpoint: "/api/conversations",
    method: "POST",
    fields: { recipientId: "input" },
  },
  {
    name: "Get Conversation by Sender and Recipient",
    endpoint: "/api/conversations",
    method: "GET",
    fields: { recipientId: "input" },
  },
  {
    name: "Get Messages in Conversation",
    endpoint: "/api/conversations/:conversationId/messages",
    method: "GET",
    fields: { conversationId: "input" },
  },
  {
    name: "Send Message",
    endpoint: "/api/conversations/:conversationId/messages",
    method: "POST",
    fields: { conversationId: "input", content: "input", offer: { company: "input", product: "input", duration: "input" } },
  },
  {
    name: "Add Response to Offer",
    endpoint: "/api/conversations/:conversationId/messages/:messageId/response",
    method: "POST",
    fields: { conversationId: "input", messageId: "input", postId: "input", response: "input" },
  },
  {
    name: "Approve Offer",
    endpoint: "/api/conversations/:conversationId/messages/:messageId/approve",
    method: "POST",
    fields: { conversationId: "input", messageId: "input" },
  },
  {
    name: "Delete Message",
    endpoint: "/api/conversations/:conversationId/messages/:messageId",
    method: "DELETE",
    fields: { conversationId: "input", messageId: "input" },
  },
  {
    name: "Create Promotion",
    endpoint: "/api/promotions",
    method: "POST",
    fields: {
      postId: "input",
      duration: "input",
    },
  },
];

/*
 * You should not need to edit below.
 * Please ask if you have questions about what this test code is doing!
 */

function updateResponse(code: string, response: string) {
  document.querySelector("#status-code")!.innerHTML = code;
  document.querySelector("#response-text")!.innerHTML = response;
}

async function request(method: HttpMethod, endpoint: string, params?: unknown) {
  try {
    if (method === "GET" && params) {
      endpoint += "?" + new URLSearchParams(params as Record<string, string>).toString();
      params = undefined;
    }

    const res = fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: params ? JSON.stringify(params) : undefined,
    });

    return {
      $statusCode: (await res).status,
      $response: await (await res).json(),
    };
  } catch (e) {
    console.log(e);
    return {
      $statusCode: "???",
      $response: { error: "Something went wrong, check your console log.", details: e },
    };
  }
}

function fieldsToHtml(fields: Record<string, Field>, indent = 0, prefix = ""): string {
  return Object.entries(fields)
    .map(([name, tag]) => {
      const htmlTag = tag === "json" ? "textarea" : tag;
      return `
        <div class="field" style="margin-left: ${indent}px">
          <label>${name}:
          ${typeof tag === "string" ? `<${htmlTag} name="${prefix}${name}"></${htmlTag}>` : fieldsToHtml(tag, indent + 10, prefix + name + ".")}
          </label>
        </div>`;
    })
    .join("");
}

function getHtmlOperations() {
  return operations.map((operation) => {
    return `<li class="operation">
      <h3>${operation.name}</h3>
      <form class="operation-form">
        <input type="hidden" name="$endpoint" value="${operation.endpoint}" />
        <input type="hidden" name="$method" value="${operation.method}" />
        ${fieldsToHtml(operation.fields)}
        <button type="submit">Submit</button>
      </form>
    </li>`;
  });
}

function prefixedRecordIntoObject(record: Record<string, string>) {
  const obj: any = {}; // eslint-disable-line
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    const keys = key.split(".");
    const lastKey = keys.pop()!;
    let currentObj = obj;
    for (const key of keys) {
      if (!currentObj[key]) {
        currentObj[key] = {};
      }
      currentObj = currentObj[key];
    }
    currentObj[lastKey] = value;
  }
  return obj;
}

async function submitEventHandler(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const { $method, $endpoint, ...reqData } = Object.fromEntries(new FormData(form));

  // Replace :param with the actual value.
  const endpoint = ($endpoint as string).replace(/:(\w+)/g, (_, key) => {
    const param = reqData[key] as string;
    delete reqData[key];
    return param;
  });

  const op = operations.find((op) => op.endpoint === $endpoint && op.method === $method);
  const pairs = Object.entries(reqData);
  for (const [key, val] of pairs) {
    if (val === "") {
      delete reqData[key];
      continue;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const type = key.split(".").reduce((obj, key) => obj[key], op?.fields as any);
    if (type === "json") {
      reqData[key] = JSON.parse(val as string);
    }
  }

  const data = prefixedRecordIntoObject(reqData as Record<string, string>);

  updateResponse("", "Loading...");
  const response = await request($method as HttpMethod, endpoint as string, Object.keys(data).length > 0 ? data : undefined);
  updateResponse(response.$statusCode.toString(), JSON.stringify(response.$response, null, 2));
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#operations-list")!.innerHTML = getHtmlOperations().join("");
  document.querySelectorAll(".operation-form").forEach((form) => form.addEventListener("submit", submitEventHandler));
});
