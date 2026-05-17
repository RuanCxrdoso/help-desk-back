## 📋 Casos de Uso (Roadmap de Desenvolvimento)

Abaixo estão todos os requisitos funcionais do sistema, modelados como Use Cases da camada de Aplicação.

### Fase 1: Autenticação, Gestão de Usuários e Multi-tenancy
- [ ✅ ] `RegisterTenantAndAdminUseCase`: Fluxo de *SaaS Onboarding*. Cria uma nova empresa (Tenant) e seu administrador fundador em uma única transação atômica.
- [ ✅ ] `RegisterAdminUseCase`: Cadastro de administradores adicionais. **Restrito a Super Administradores**. 
- [ ✅ ] `RegisterTechnicianUseCase`: Cadastro de técnicos operacionais. **Restrito a Administradores**.
- [ ✅ ] `RegisterEmployeeUseCase`: Cadastro de funcionários. **Restrito a Administradores**.
- [ ✅ ] `AuthenticateSuperAdminUseCase`: Autenticação global (Host). Retorna JWT sem `tenantId`.
- [ ✅ ] `AuthenticateUseCase`: Autenticação de usuários do tenant. Requer `tenantSlug` e retorna JWT com `tenantId`.
- [ ✅ ] `Setup de Autorização (CASL ABAC)`: Fábrica de regras granulares baseada em papéis, escopo de tenant e estado do recurso.
- [ ✅ ] `GetAdminProfileUseCase`: Retorna dados detalhados do perfil de um Administrador.
- [ ✅ ] `GetEmployeeProfileUseCase`: Retorna dados detalhados do perfil de um Funcionário.
- [ ✅ ] `GetTechnicianProfileUseCase`: Retorna dados detalhados do perfil de um Técnico.
- [ ✅ ] `GetSuperAdminProfileUseCase`: Retorna dados detalhados do perfil de um Super Administrador.

### Fase 2: Infraestrutura de Arquivos (Storage)
- [ ] `UploadAndCreateAttachmentUseCase`: Recebe um arquivo via `multipart/form-data`, valida formato/tamanho, faz o upload para o Storage (ex: AWS S3 ou R2) e persiste o registro lógico no banco.

### Fase 3: Domínio Core - Visão do Funcionário (Employee)
- [ ] `CreateTicketUseCase`: Abertura de um chamado contendo título, descrição, categoria, prioridade e anexos iniciais (vinculação via Watched Lists). Status inicial obrigatório: `OPEN`.
- [ ] `EditTicketUseCase`: Permite ao autor alterar título/descrição e gerenciar anexos. **Bloqueado** se o ticket estiver `CLOSED`, `CANCELLED` ou `RESOLVED`.
- [ ] `CancelTicketUseCase`: Autor cancela o próprio chamado. Permitido apenas se o ticket não estiver finalizado definitivamente.
- [ ] `FetchEmployeeTicketsUseCase`: Listagem paginada dos tickets pertencentes exclusivamente ao funcionário logado.
- [ ] `GetTicketDetailsUseCase`: Retorna todos os dados de um ticket. Valida se o usuário logado é o autor original, um técnico ou admin.

### Fase 4: Domínio Core - Visão do Técnico (Technician)
- [ ] `FetchAllTicketsUseCase`: Listagem global paginada com suporte a filtros combinados (status, prioridade, categoria) e ordenação. Fonte de dados para o TanStack Table.
- [ ] `AssignTicketUseCase`: Técnico assume o ticket. Altera o status de `OPEN` para `IN_PROGRESS` e define o `assigneeId`. (Gatilho para Domain Event).
- [ ] `ResolveTicketUseCase`: Técnico finaliza o atendimento com uma nota técnica de resolução. Altera status para `RESOLVED`. (Gatilho para Domain Event).
- [ ] `CloseTicketUseCase`: Fechamento definitivo (`CLOSED`). Restrito a tickets que estão previamente com status `RESOLVED`.
- [ ] `UnassignTicketUseCase`: Técnico devolve o ticket para a fila (`OPEN`), removendo sua autoria.
- [ ] `ReopenTicketUseCase`: Ticket retorna para `IN_PROGRESS` (se já possuía um técnico) ou para `OPEN` (se não possuía) caso o problema persista.

### Fase 5: Interações e Histórico (Thread)
- [ ] `CommentOnTicketUseCase`: Permite envio de mensagens na thread do chamado para tirar dúvidas ou pedir mais informações.
- [ ] `FetchTicketCommentsUseCase`: Listagem paginada do histórico de mensagens de um ticket específico.

### Fase 6: Eventos de Domínio e Efeitos Colaterais (Background)
- [ ] `OnTicketAssigned` (Subscriber): Ouve a transição para `IN_PROGRESS` e invoca o envio de e-mail ao autor original informando qual técnico assumiu o chamado.
- [ ] `OnTicketResolved` (Subscriber): Ouve a transição para `RESOLVED` e invoca o envio de e-mail ao autor contendo a nota de resolução do técnico.
- [ ] `SendEmailNotificationUseCase`: Executa o disparo real do e-mail utilizando provedor externo.

---

## 🔐 Matriz de Permissões (RBAC & ABAC)

O controle de acesso foi implementado utilizando a biblioteca **@casl/ability**, garantindo isolamento rigoroso de Multi-Tenancy (`tenantId`) e validando a propriedade dos dados (`employeeId`, `technicianId`) em tempo de execução. As políticas de segurança operam em conjunto com a máquina de estados das Entidades de Domínio.

| Recurso / Ação | Funcionário (`EMPLOYEE`) | Técnico (`TECHNICIAN`) | Admin Inquilino (`ADMIN`) | Regras de Segurança e Domínio (CASL) |
| :--- | :--- | :--- | :--- | :--- |
| **Autenticação e Perfil** | Ler/Atualizar (Próprio) | Ler/Atualizar (Próprio) | Gerenciar (Todos do Inquilino)| Regra anti-orfandade: Usuários (incluindo Admin) não deletam a própria conta. |
| **Listar Usuários** | Permitido (Mesmo Tenant) | Permitido (Mesmo Tenant) | Permitido (Todos) | Permite visibilidade interna. Gestão (Create/Delete) é exclusiva de Admins. |
| **Criar Ticket** | Permitido | Negado | Permitido | Apenas solicitantes reais (Employees) e Admins abrem chamados. |
| **Listar/Ler Tickets** | Permitido (Apenas seus) | Permitido (Todos) | Permitido (Todos) | Funcionários veem apenas tickets onde `employeeId === user.sub`. |
| **Atualizar Dados** | Permitido (Apenas seus) | Permitido (Seus ou Sem dono)| Permitido | **Imutabilidade:** Bloqueado se `status` for `CLOSED`, `CANCELLED` ou `RESOLVED`. |
| **Deletar Ticket** | Negado | Negado | Permitido | Apenas Admins deletam. SuperAdmin gerencia cross-tenant. |
| **Assumir (`Assign`)** | Negado | Permitido (Sem dono) | Permitido | Válido apenas para tickets `OPEN` ou `IN_PROGRESS` sem técnico atribuído. |
| **Desatribuir/Resolver**| Negado | Permitido (Apenas seus) | Permitido | Travado na Entidade se o status não for `OPEN` ou `IN_PROGRESS`. |
| **Cancelar / Reabrir** | Permitido (Apenas seus) | Permitido (Apenas seus) | Permitido | Reabrir move para `IN_PROGRESS` se houver técnico, ou `OPEN` se estiver vago. |
| **Fechar Ticket** | Permitido (Apenas seus) | Negado | Permitido | **Fluxo de Confirmação:** Só é permitido fechar tickets com status `RESOLVED`. |

> **Nota de Sistema (`SUPER_ADMIN`):** O Super Administrador possui permissão global e cross-tenant (`Manage: 'all'`). Ele administra os Tenants da plataforma SaaS e gerencia assinaturas, sendo tecnicamente bloqueado apenas de executar a exclusão do próprio perfil.