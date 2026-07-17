import { SetMetadata } from '@nestjs/common'
import { AppAbility } from './casl-ability.factory'

export type PolicyHandlerCallback = (ability: AppAbility) => boolean

export const CHECK_POLICIES_KEY = 'check_policies'

// Isso aqui vai anexar nos metadados da request todas as regras a serem checadas para liberar o acesso ao controller.
export const CheckPolicies = (...handlers: PolicyHandlerCallback[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers)
