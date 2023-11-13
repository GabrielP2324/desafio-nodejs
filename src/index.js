"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.client = void 0;
var client_1 = require("@prisma/client");
var prisma_field_encryption_1 = require("prisma-field-encryption");
var prisma = new client_1.PrismaClient();
exports.client = prisma.$extends(
// This is a function, don't forget to call it:
(0, prisma_field_encryption_1.fieldEncryptionExtension)());
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var allUsers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.user.findMany()];
                case 1:
                    allUsers = _a.sent();
                    console.log('All users: ');
                    console.dir(allUsers, { depth: null });
                    return [2 /*return*/];
            }
        });
    });
}
function addMemberToProject(projectId, userId, creatorId) {
    return __awaiter(this, void 0, void 0, function () {
        var project;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.project.findUnique({
                        where: { id: projectId },
                        include: { members: true }
                    })];
                case 1:
                    project = _a.sent();
                    if (!project) {
                        throw new Error('Projeto não encontrado.');
                    }
                    if (project.members[0].id !== creatorId) {
                        throw new Error('Somente o criador do projeto pode adicionar membros.');
                    }
                    if (project.members.some(function (member) { return member.id === userId; })) {
                        throw new Error('O usuário já é um membro deste projeto.');
                    }
                    return [4 /*yield*/, prisma.project.update({
                            where: { id: projectId },
                            data: {
                                members: {
                                    connect: { id: userId }
                                }
                            }
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Função para criar uma tarefa
function createTask(userId, projectId, title, description, tags) {
    return __awaiter(this, void 0, void 0, function () {
        var projectWithMembers, task;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.project.findUnique({
                        where: { id: projectId },
                        include: { members: true }
                    })];
                case 1:
                    projectWithMembers = _a.sent();
                    if (!projectWithMembers) {
                        throw new Error('Projeto não encontrado.');
                    }
                    if (!projectWithMembers.members.some(function (member) { return member.id === userId; })) {
                        throw new Error('Você não é membro deste projeto e não pode criar tarefas.');
                    }
                    if (!tags || tags.length === 0) {
                        throw new Error('As tarefas precisam ter pelo menos uma tag.');
                    }
                    return [4 /*yield*/, prisma.task.create({
                            data: {
                                title: title,
                                description: description,
                                tags: {
                                    create: tags.map(function (tag) { return ({ title: tag }); })
                                },
                                user: { connect: { id: userId } },
                                project: { connect: { id: projectId } },
                                status: client_1.TaskStatus.Pending
                            }
                        })];
                case 2:
                    task = _a.sent();
                    return [2 /*return*/, task];
            }
        });
    });
}
// Função para remover um membro de um projeto
function removeMemberFromProject(projectId, userId, creatorId) {
    return __awaiter(this, void 0, void 0, function () {
        var project;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.project.findUnique({
                        where: { id: projectId },
                        include: { members: true }
                    })];
                case 1:
                    project = _a.sent();
                    if (!project) {
                        throw new Error('Projeto não encontrado.');
                    }
                    if (project.members[0].id !== creatorId) {
                        throw new Error('Somente o criador do projeto pode remover membros.');
                    }
                    if (!project.members.some(function (member) { return member.id === userId; })) {
                        throw new Error('O usuário não é membro deste projeto.');
                    }
                    return [4 /*yield*/, prisma.project.update({
                            where: { id: projectId },
                            data: {
                                members: {
                                    disconnect: { id: userId }
                                }
                            }
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Função para editar uma tarefa
function editTask(taskId, userId, title, description, tags, status) {
    return __awaiter(this, void 0, void 0, function () {
        var task;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.task.findUnique({
                        where: { id: taskId },
                        include: { project: { include: { members: true } } }
                    })];
                case 1:
                    task = _a.sent();
                    if (!task) {
                        throw new Error('Tarefa não encontrada.');
                    }
                    if (task.status === 'Completed') {
                        throw new Error('Tarefas concluídas não podem ser editadas.');
                    }
                    if (!task.project.members.some(function (member) { return member.id === userId; })) {
                        throw new Error('Você não é membro deste projeto e não pode editar a tarefa.');
                    }
                    return [4 /*yield*/, prisma.task.update({
                            where: { id: taskId },
                            data: {
                                title: title,
                                description: description,
                                tags: {
                                    create: tags.map(function (tag) { return ({ title: tag }); })
                                },
                                status: status
                            }
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Função para adicionar um usuário a um projeto
function addUserToProject(userId, projectId) {
    return __awaiter(this, void 0, void 0, function () {
        var user, project;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.user.findUnique({
                        where: { id: userId }
                    })];
                case 1:
                    user = _a.sent();
                    if (!user) {
                        throw new Error('Usuário não encontrado na plataforma.');
                    }
                    return [4 /*yield*/, prisma.project.findUnique({
                            where: { id: projectId }
                        })];
                case 2:
                    project = _a.sent();
                    if (!project) {
                        throw new Error('Projeto não encontrado.');
                    }
                    return [4 /*yield*/, prisma.project.update({
                            where: { id: projectId },
                            data: {
                                members: {
                                    connect: { id: userId }
                                }
                            }
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Função para marcar uma tarefa como concluída
function completeTask(taskId, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var task;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.task.findUnique({
                        where: { id: taskId },
                        include: { project: { include: { members: true } } }
                    })];
                case 1:
                    task = _a.sent();
                    if (!task) {
                        throw new Error('Tarefa não encontrada.');
                    }
                    if (!task.project.members.some(function (member) { return member.id === userId; })) {
                        throw new Error('Você não é membro deste projeto e não pode completar a tarefa.');
                    }
                    return [4 /*yield*/, prisma.task.update({
                            where: { id: taskId },
                            data: {
                                status: 'Completed'
                            }
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Função para editar uma tarefa concluída
function editCompletedTask(taskId) {
    return __awaiter(this, void 0, void 0, function () {
        var task;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.task.findUnique({
                        where: { id: taskId }
                    })];
                case 1:
                    task = _a.sent();
                    if (!task) {
                        throw new Error('Tarefa não encontrada.');
                    }
                    if (task.status === 'Completed') {
                        throw new Error('Tarefas concluídas não podem ser editadas.');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// Função para criar uma nova tag
function createTag(title, taskId) {
    return __awaiter(this, void 0, void 0, function () {
        var tag;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.tag.create({
                        data: {
                            title: title,
                            task: { connect: { id: taskId } }
                        }
                    })];
                case 1:
                    tag = _a.sent();
                    return [2 /*return*/, tag];
            }
        });
    });
}
// Função para deletar uma tag
function deleteTag(tagId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.tag["delete"]({
                        where: { id: tagId }
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
