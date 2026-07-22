import { Router, type IRouter } from "express";
import { LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

// 3 known users — simple email-based auth, no passwords
const KNOWN_USERS = [
  { id: 1, name: "Tashmeet", email: "tashmeet@company.com" },
  { id: 2, name: "Alex", email: "alex@company.com" },
  { id: 3, name: "Jordan", email: "jordan@company.com" },
];

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const user = KNOWN_USERS.find(
    (u) => u.email.toLowerCase() === parsed.data.email.toLowerCase(),
  );

  if (!user) {
    res.status(401).json({ error: "Unknown email. Only authorised team members can log in." });
    return;
  }

  (req.session as any).user = user;
  res.json(user);
});

router.get("/auth/me", (req, res): void => {
  const user = (req.session as any)?.user;
  if (!user) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }
  res.json(user);
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

export default router;
