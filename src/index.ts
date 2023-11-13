import { PrismaClient, TaskStatus } from '@prisma/client'
import { fieldEncryptionExtension } from 'prisma-field-encryption'
 
import express from 'express'

const prisma = new PrismaClient()
import bodyParser from 'body-parser';

const app = express();

export const client = prisma.$extends(
    // This is a function, don't forget to call it:
    fieldEncryptionExtension()
  )

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

  app.listen(8000, () =>
  console.log('REST API server ready at: http://localhost:3000'),
)

app.use(bodyParser.json());


app.post('/addMemberToProject', async (req, res) => {
  try {
    const { projectId, userId, creatorId } = req.body;
    await addMemberToProject(projectId, userId, creatorId);
    res.status(200).json({ message: 'Member added to the project successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Create a task
app.post('/createTask', async (req, res) => {
  try {
    const { userId, projectId, title, description, tags } = req.body;
    const task = await createTask(userId, projectId, title, description, tags);
    res.status(200).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Remove a member from a project
app.post('/removeMemberFromProject', async (req, res) => {
  try {
    const { projectId, userId, creatorId } = req.body;
    await removeMemberFromProject(projectId, userId, creatorId);
    res.status(200).json({ message: 'Member removed from the project successfully' });
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
});

// Edit a task
app.put('/editTask/:taskId', async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const { userId, title, description, tags, status } = req.body;
    await editTask(taskId, userId, title, description, tags, status);
    res.status(200).json({ message: 'Task edited successfully' });
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
});

// Add a user to a project
app.post('/addUserToProject', async (req, res) => {
  try {
    const { userId, projectId } = req.body;
    await addUserToProject(userId, projectId);
    res.status(200).json({ message: 'User added to the project successfully' });
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
});

// Complete a task
app.put('/completeTask/:taskId', async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const { userId } = req.body;
    await completeTask(taskId, userId);
    res.status(200).json({ message: 'Task completed successfully' });
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
});

// Edit a completed task
app.put('/editCompletedTask/:taskId', async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    await editCompletedTask(taskId);
    res.status(200).json({ message: 'Completed task cannot be edited' });
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
});

// Create a new tag
app.post('/createTag', async (req, res) => {
  try {
    const { title, taskId } = req.body;
    const tag = await createTag(title, taskId);
    res.status(200).json(tag);
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a tag
app.delete('/deleteTag/:tagId', async (req, res) => {
  try {
    const tagId = parseInt(req.params.tagId);
    await deleteTag(tagId);
    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(8000, () => {
  console.log(`Server is running on port ${8000}`);
});