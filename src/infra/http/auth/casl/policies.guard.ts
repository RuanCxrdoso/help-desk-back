import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import {
  CHECK_POLICIES_KEY,
  PolicyHandlerCallback,
} from './check-policies.decorator'
import { TokenPayload } from '../../auth/jwt.strategy'
import { CaslAbilityFactory } from './casl-ability.factory'

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Pegamos o array das policies, ou seja, o array com as regras necessárias para ter acesso ao controller.
    const policyHandlers = this.reflector.get<PolicyHandlerCallback[]>(
      CHECK_POLICIES_KEY,
      context.getHandler(),
    )

    if (!policyHandlers || policyHandlers.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user: TokenPayload = request.user

    if (!user) {
      throw new ForbiddenException('User payload not found in request')
    }

    // Dado o usuário (e sua role), criamos a sua ability que contém todas as autorizações que esse usuário possui.
    const ability = this.caslAbilityFactory.createForUser(user)

    // Fazemos uma iteração sobre cada uma das regras (policies) testando se o usuário está autorizado a realizá-la, ele precisa estar autorizado a realizar todas as ações que estão contidas no array para poder ter acesso ao controller.
    const isAllowed = policyHandlers.every((handler) => handler(ability))

    if (!isAllowed) {
      throw new ForbiddenException(
        'You do not have permission to execute this action',
      )
    }

    return true
  }
}
