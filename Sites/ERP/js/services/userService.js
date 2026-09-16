/**
 * userService.js — administração de usuários e perfis de acesso.
 */
const UserService = (() => {
  const COL = COLLECTIONS.USERS;

  function getAll() { return StorageService.getAll(COL); }
  function getById(id) { return StorageService.getById(COL, id); }

  function emailExists(email, ignoreId) {
    return getAll().some((u) => u.email.toLowerCase() === String(email).toLowerCase() && u.id !== ignoreId);
  }

  function create(data) {
    if (!data.name || !data.name.trim()) throw new Error('Informe o nome do usuário.');
    if (!Utils.validateEmail(data.email)) throw new Error('Informe um e-mail válido.');
    if (emailExists(data.email)) throw new Error('Já existe um usuário com este e-mail.');
    if (!data.password || data.password.length < 6) throw new Error('A senha deve ter ao menos 6 caracteres.');
    const code = Utils.nextSequentialCode(getAll(), 'USR');
    return StorageService.insert(COL, {
      id: code, name: data.name.trim(), email: data.email.trim(), login: data.login || data.email.split('@')[0],
      role: data.role, profileDescription: Auth.ROLE_DESCRIPTIONS[data.role] || '', status: data.status || 'ativo',
      passwordHash: Auth.hashPassword(data.password),
    });
  }

  function update(id, patch) {
    const clean = Object.assign({}, patch);
    if (clean.email && emailExists(clean.email, id)) throw new Error('Já existe um usuário com este e-mail.');
    if (clean.role) clean.profileDescription = Auth.ROLE_DESCRIPTIONS[clean.role] || '';
    if (clean.password) {
      if (clean.password.length < 6) throw new Error('A senha deve ter ao menos 6 caracteres.');
      clean.passwordHash = Auth.hashPassword(clean.password);
    }
    delete clean.password;
    return StorageService.update(COL, id, clean);
  }

  function remove(id) {
    const current = Auth.currentUser();
    if (current && current.userId === id) throw new Error('Você não pode excluir o próprio usuário logado.');
    return StorageService.remove(COL, id);
  }

  function changePassword(id, currentPassword, newPassword) {
    const user = getById(id);
    if (!user) throw new Error('Usuário não encontrado.');
    if (user.passwordHash !== Auth.hashPassword(currentPassword)) throw new Error('Senha atual incorreta.');
    if (!newPassword || newPassword.length < 6) throw new Error('A nova senha deve ter ao menos 6 caracteres.');
    return StorageService.update(COL, id, { passwordHash: Auth.hashPassword(newPassword) });
  }

  function count() { return getAll().length; }
  function activeCount() { return getAll().filter((u) => u.status === 'ativo').length; }

  return { getAll, getById, create, update, remove, changePassword, count, activeCount };
})();
