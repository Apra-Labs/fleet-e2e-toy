CHANGES NEEDED

Notes:
- Coverage: Sprint tasks gh-toy-n05.1, gh-toy-n05.2, and gh-toy-n05.3 do not reference the original backlog issues in their descriptions. They should link to gh-toy-mi2, gh-toy-7rp, and gh-toy-4ef to ensure the original requirements are tracked and closed.
- Acceptance Criteria: gh-toy-n05.3's AC is incomplete. It must explicitly mention the required/optional flags for each subcommand (e.g., --tag, --q, --id, --title, --content) and require a non-zero exit code on API errors. gh-toy-n05.1's AC could also explicitly mention the exit codes.
- Model-Tier Assignment: gh-toy-n05.3 implements 5 different subcommands with API interactions, making it an 'L' (large) task. However, it is assigned 'standard' tier. It should be escalated to 'premium' tier.
- Dependency Direction: The dependencies are correct (gh-toy-n05.1 establishes the foundation and correctly blocks gh-toy-n05.2 and gh-toy-n05.3). No bd commands are needed.

taskAssignments:
[{"id":"gh-toy-n05.1","bucket":"M","model":"standard"},{"id":"gh-toy-n05.2","bucket":"S","model":"cheap"},{"id":"gh-toy-n05.3","bucket":"L","model":"standard"}]
