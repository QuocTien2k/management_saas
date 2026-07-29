# Skill: Refactor Code

This skill guides the AI agent through the standard operating procedure (SOP) for improving the internal structure, readability, and performance of existing code **without** changing its external behavior or business logic.

---

## 1. Scope & Execution Context

* **Primary Directory:** `backend/src/` or `frontend/src/`
* **Core Reference Docs:**
  * `@docs/Development/Coding-Standards.md` *(Strict adherence required for naming, formatting, and linting rules)*
  * `@docs/Development/Tech-Stack.md` *(To ensure refactored code uses approved tools and versions)*

---

## 2. Standard Workflow for Refactoring

### Step 1: Analyze & Isolate
* Identify the specific file, function, or component to be refactored.
* Understand the current inputs, outputs, and side effects. **The external contract must remain identical.**

### Step 2: Identify Code Smells
Evaluate the code against project standards to find improvement areas:
* Duplicate code (DRY principle violations).
* Overly long functions or "God objects".
* Deeply nested conditionals (Callback hell or arrow-code).
* Poor variable/function naming.
* Direct database calls inside controllers (Separation of Concerns violation).

### Step 3: Execute Refactoring Strategies
Apply clean code principles:
* **Extract Function/Component:** Break down large blocks into smaller, reusable, testable units.
* **Rename:** Update variables/methods to reflect their actual purpose clearly.
* **Simplify Conditionals:** Use early returns (guard clauses) to flatten nested `if/else` statements.
* **Type Safety:** Replace `any` types with strict TypeScript interfaces/DTOs.

### Step 4: Verification Checklist
* Check if the refactored code still fulfills all original business requirements.
* Ensure all imported dependencies are correctly updated.
* Suggest running relevant unit tests (or trigger `@.agents/skills/write-test/`) to verify functionality.

---

## 3. Example Execution Scenario

**User Input:**
> "Refactor lại hàm processPayment trong payment.service.ts vì nó quá dài và nhiều if/else lồng nhau."

**Agent Behavior:**
1. **Load Context:** Read `payment.service.ts` and `@docs/Development/Coding-Standards.md`.
2. **Analysis:** Identifies deep nesting and mixed responsibilities (validation, API call, DB update).
3. **Refactoring Output:**
   * Extracts validation logic into a private method `validatePaymentPayload()`.
   * Implements early returns to eliminate nested `else` blocks.
   * Keeps the main `processPayment` method clean, acting as a coordinator.
4. **Confirmation:** Assures the user that the return type and inputs remain completely unchanged.

---

## 4. Guardrails

* **DO NOT** change the business logic, API payload shapes, or database schema during a refactor.
* **DO NOT** introduce new features or bug fixes under the guise of refactoring. (If a bug is found, notify the user first).
* **DO NOT** remove existing comments unless they are obsolete; instead, ensure the code is self-documenting.