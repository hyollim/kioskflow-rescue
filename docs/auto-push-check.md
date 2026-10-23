# Automated GitHub Upload Check

## Purpose

Verify the handoff between Aside and the existing macOS service `com.kioskflow-auto-push`:
Aside creates one local test commit and a request marker, while the Mac service performs the GitHub push.
Aside must not run `git push` directly.

## Scope

- Repository: `https://github.com/hyollim/kioskflow-rescue.git`
- Working directory: `/Users/hyolim/projects/kioskflow-rescue`
- Branch: `feature/autonomous-build`
- Test document: `docs/auto-push-check.md`
- Commit message: `test: verify automated GitHub upload`
- Request marker: `.git/aside-push-request`
- Test date: 2026-10-24 (Asia/Seoul)

## Verification procedure

1. Confirm the repository root, origin fetch/push URLs, and active branch match the scope above.
2. Confirm the working tree is clean and neither the test document nor request marker already exists.
3. Create this document, stage only this file, and commit it with the specified message.
4. After successful commit and final approval, create the request marker without overwriting an existing file.
5. Allow the existing Mac service to perform its scheduled upload; do not invoke Git push from Aside.
6. Verify that the remote feature branch resolves to the new local commit SHA.
7. Open GitHub and confirm the new commit message, the single added document, and its contents.
8. Confirm that the remote `main` SHA is unchanged and report the commit and file URLs.

## Safety boundaries

Do not access other repositories, modify `main`, delete or overwrite existing files, change GitHub credentials,
Keychain, global Git configuration, the automatic-push script, or LaunchAgent settings.
Do not expand authentication permissions or begin full project development or deployment.
If the service upload fails, report the observed cause instead of bypassing the service.

## Result handling

This document records the test plan. Commit creation, service handoff, and remote verification are still pending
when it is written. The final execution report provides the observed result and the exact commit URL.
