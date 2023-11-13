import { PrismaClient, TaskStatus } from '@prisma/client'
import { fieldEncryptionExtension } from 'prisma-field-encryption'

const prisma = new PrismaClient()


export const client = prisma.$extends(
    // This is a function, don't forget to call it:
    fieldEncryptionExtension()
  )

async function main() {
  
  const allUsers = await prisma.user.findMany(
    
  )
  console.log('All users: ')
  console.dir(allUsers, { depth: null })
}

async function addMemberToProject(projectId:number, userId:number, creatorId:number) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });
  
    if (!project) {
      throw new Error('Projeto não encontrado.');
    }
  
    if (project.members[0].id !== creatorId) {
      throw new Error('Somente o criador do projeto pode adicionar membros.');
    }
  
    if (project.members.some((member) => member.id === userId)) {
      throw new Error('O usuário já é um membro deste projeto.');
    }
  
    await prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          connect: { id: userId },
        },
      },
    });
  }
  
  // Função para criar uma tarefa
  async function createTask(userId:number, projectId:number, title:string, description:string, tags:string[]) {
    const projectWithMembers = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true },
    });

    if (!projectWithMembers) {
        throw new Error('Projeto não encontrado.');
    }

    if (!projectWithMembers.members.some((member: { id: number }) => member.id === userId)) {
        throw new Error('Você não é membro deste projeto e não pode criar tarefas.');
    }

    if (!tags || tags.length === 0) {
            throw new Error('As tarefas precisam ter pelo menos uma tag.');
    }

    const task = await prisma.task.create({
        data: {
            title,
            description,
            tags: {
                create: tags.map((tag) => ({ title: tag })),
            },
            user: { connect: { id: userId } },
            project: { connect: { id: projectId } },
            status: TaskStatus.Pending
        },
    });
  
    return task;
  }
  
  // Função para remover um membro de um projeto
  async function removeMemberFromProject(projectId: number, userId: number, creatorId: number) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });
  
    if (!project) {
      throw new Error('Projeto não encontrado.');
    }
  
    if (project.members[0].id !== creatorId) {
      throw new Error('Somente o criador do projeto pode remover membros.');
    }
  
    if (!project.members.some((member) => member.id === userId)) {
      throw new Error('O usuário não é membro deste projeto.');
    }
  
    await prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          disconnect: { id: userId },
        },
      },
    });
  }
  
  // Função para editar uma tarefa
  async function editTask(taskId: number, userId: number, title: string, description: string, tags: string[], status: any) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });
  
    if (!task) {
      throw new Error('Tarefa não encontrada.');
    }
  
    if (task.status === 'Completed') {
      throw new Error('Tarefas concluídas não podem ser editadas.');
    }
  
    if (!task.project.members.some((member) => member.id === userId)) {
      throw new Error('Você não é membro deste projeto e não pode editar a tarefa.');
    }
  
    await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        tags: {
          create: tags.map((tag) => ({ title: tag })),
        },
        status,
      },
    });
  }
  
  // Função para adicionar um usuário a um projeto
  async function addUserToProject(userId:number, projectId:number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
  
    if (!user) {
      throw new Error('Usuário não encontrado na plataforma.');
    }
  
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
  
    if (!project) {
      throw new Error('Projeto não encontrado.');
    }
  
    await prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          connect: { id: userId },
        },
      },
    });
  }

  // Função para marcar uma tarefa como concluída
async function completeTask(taskId: number, userId: number) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });
  
    if (!task) {
      throw new Error('Tarefa não encontrada.');
    }
  
    if (!task.project.members.some((member) => member.id === userId)) {
      throw new Error('Você não é membro deste projeto e não pode completar a tarefa.');
    }
  
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'Completed',
      },
    });
  }
  
  // Função para editar uma tarefa concluída
  async function editCompletedTask(taskId: number) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });
  
    if (!task) {
      throw new Error('Tarefa não encontrada.');
    }
  
    if (task.status === 'Completed') {
      throw new Error('Tarefas concluídas não podem ser editadas.');
    }
    // Se for necessário alguma edição específica em uma tarefa concluída, adicione a lógica aqui.
  }
  
  // Função para criar uma nova tag
  async function createTag(title: string, taskId: number) {
    const tag = await prisma.tag.create({
      data: {
        title,
        task: { connect: { id: taskId } },
      },
    });
  
    return tag;
  }
  
  // Função para deletar uma tag
  async function deleteTag(tagId:number) {
    await prisma.tag.delete({
      where: { id: tagId },
    });
  }
  
  
  // Exemplos de uso:
  
  // Marcar uma tarefa como concluída
  // completeTask(taskId, userId);
  
  // Editar uma tarefa concluída
  // editCompletedTask(taskId);
  
  // Criar uma nova tag
  // createTag(title, taskId);
  
  // Deletar uma tag
  // deleteTag(tagId);
  
  // Adicionar um membro a um projeto
  // addMemberToProject(projectId, userId, creatorId);
  
  // Criar uma tarefa
  // createTask(userId, projectId, title, description, tags);
  
  // Remover um membro de um projeto
  // removeMemberFromProject(projectId, userId, creatorId);
  
  // Editar uma tarefa
  // editTask(taskId, userId, title, description, tags, status);
  
  // Adicionar um usuário a um projeto
  // addUserToProject(userId, projectId);

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())


