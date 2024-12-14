import app from "../../src";
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { createTestUserToken } from "../authHelper";
import userModels from "../../src/models/user";
import { User } from "../../src/types/user";

let token: string;
let user: User;

beforeAll(async () => {
  user = (await userModels.createUser({
    email: "testdev1@gmail.com",
    firstName: "Test",
    lastName: "Dev",
    password: "testdev123",
    role: "ADMIN",
  })) as User;

  token = await createTestUserToken(user);
});

afterAll(async () => {
  await userModels.deleteUser(user.id);
});

describe("GET /users", () => {
  it("Should return 200 OK if user is authenticated and authorized", async () => {
    const res = await app.request("/v1/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toContainKeys(["data", "current_page", "total_pages"]);
  });

  it("Should return 401 Unauthorized if user is not authenticated", async () => {
    const res = await app.request("/v1/users", {
      method: "GET",
    });

    expect(res.status).toBe(401);
  });

  it("Should return 401 Unauthorized if user is not authorized", async () => {
    const res = await app.request("/v1/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer 123`,
      },
    });

    expect(res.status).toBe(401);
  });
});

describe("GET /users/:id", () => {
  it("Should return 200 OK if user is authenticated and authorized", async () => {
    const res = await app.request(`/v1/users/${user.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.status).toBe(200);

    const data = await res.json();

    expect(data).toContainKeys(["data"]);
    expect(data.data).toContainKeys(["id", "email", "first_name", "last_name", "role", "created_at", "updated_at", "refresh_token", "credits", "is_verified"]);
  });

  it("Should return 401 Unauthorized if user is not authenticated", async () => {
    const res = await app.request(`/v1/users/${user.id}`, {
      method: "GET",
    });

    expect(res.status).toBe(401);
  });

  it("Should return 401 Unauthorized if user is not authorized and not ADMIN", async () => {
    const otherUser: User = {
      id: "abc123",
      email: "otheruser@gmail.com",
      firstName: "Other",
      lastName: "User",
      password: "other123",
      refreshToken: "",
      role: "USER",
    };

    const otherToken = await createTestUserToken(otherUser);

    const res = await app.request(`/v1/users/${user.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${otherToken}`,
      },
    });

    expect(res.status).toBe(401);
  });

  it("Should return 404 Not Found if user is not found", async () => {
    const res = await app.request(`/v1/users/abc123`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.status).toBe(404);
  });
});
