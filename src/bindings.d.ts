export interface Bindings {
  TERRAFORM_STATE: KVNamespace
  TERRAFORM_STATE_LOCKS: KVNamespace
  SENTRY_DSN: string
}

declare global {
  function getMiniflareBindings(): Bindings
}
