# Skill: Write Test

This skill guides the AI agent through the standard operating procedure (SOP) for creating robust, maintainable, and comprehensive automated tests (Unit, Integration) for the project.

---

## 1. Scope & Execution Context

* **Primary Directory:** `backend/src/` or `frontend/src/` (specifically files ending in `.spec.ts` or `.test.ts`).
* **Core Reference Docs:**
  * `@docs/Development/Coding-Standards.md` *(For testing library preferences and naming conventions)*
  * `@docs/Architecture/API.md` *(To assert correct API responses)*

---

## 2. Standard Workflow for Writing Tests

### Step 1: Analyze the Target Code
* Identify the function, component, or service to be tested.
* Understand its dependencies (e.g., Database repositories, external APIs, child components).
* List all possible execution paths: **Happy path**, **Edge cases**, and **Error handling**.

### Step 2: Setup and Mocking
* Setup the test suite using the project's standard framework (e.g., Jest, Vitest).
* Mock all external dependencies to ensure the test is isolated (Unit Test). 
* Use dependency injection testing utilities if available (e.g., `@nestjs/testing` for backend).

### Step 3: Implement Test Cases (AAA Pattern)
Follow the **Arrange, Act, Assert** pattern for every test:
1. **Arrange:** Set up the test data (mocks, spies, inputs).
2. **Act:** Execute the function or render the component.
3. **Assert:** Verify the outcome (returned value, state change, thrown exception, or dependency invocation).

### Step 4: Describe Blocks & Naming
* Use clear, descriptive names for `describe` and `it/test` blocks.
* Example: `describe('AuthService') -> describe('login()') -> it('should return a JWT token if credentials are valid')`.

---

## 3. Example Execution Scenario

**User Input:**
> "Viết unit test cho hàm createBranch trong branch.service.ts"

**Agent Behavior:**
1. **Analyze:** Examines `branch.service.ts` to see that `createBranch` depends on `BranchRepository`.
2. **Setup:** Generates `branch.service.spec.ts`, creating a mock `BranchRepository`.
3. **Implement Cases:**
   * *Happy Path:* Mocks repository to return a successful save. Asserts that the created branch object is returned.
   * *Error Path:* Mocks repository to throw a "Duplicate Key" error. Asserts that a `ConflictException` is thrown.
4. **Output:** Delivers the fully functional `branch.service.spec.ts` file.

---

## 4. Guardrails

* **DO NOT** write tests that connect to a live production database or external API. Always use mocks/stubs for Unit Tests.
* **DO NOT** test the framework (e.g., don't test if Express/NestJS router works, test the Controller logic).
* **DO NOT** write flaky tests that depend on exact timestamps, random generation, or execution order. Use mock dates/timers if necessary.