# Publicar no GitHub + Vercel

## 1. Subir o projeto no GitHub

### Se ainda não inicializou o Git na pasta do projeto
No terminal, na pasta **DHC** (pasta raiz do projeto):

```bash
cd "C:\Users\user\OneDrive - Creare Sistemas\Área de Trabalho\DHC"
git init
git add .
git commit -m "Primeiro commit - Módulo de Eventos"
```

### Criar o repositório no GitHub
1. Acesse [github.com](https://github.com) e faça login.
2. Clique em **"+"** → **"New repository"**.
3. Nome sugerido: `dhc-modulo-eventos` (ou outro).
4. Deixe **público**, não marque "Add a README".
5. Clique em **"Create repository"**.

### Conectar e enviar o código
No terminal (na pasta DHC):

```bash
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

(Substitua `SEU_USUARIO` e `SEU_REPOSITORIO` pelo seu usuário e nome do repositório.)

---

## 2. Conectar o repositório na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login (use **"Continue with GitHub"**).
2. Clique em **"Add New..."** → **"Project"**.
3. Importe o repositório que você criou (autorize o Vercel a acessar o GitHub se pedir).
4. **Importante – configuração do build:**
   - **Root Directory:** clique em **"Edit"** e selecione **`Modulo de eventos`** (a pasta onde está o `package.json` do app).
   - **Framework Preset:** Vite (a Vercel costuma detectar).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Clique em **"Deploy"**.

Quando terminar, a Vercel vai mostrar um link público, por exemplo:  
`https://dhc-modulo-eventos.vercel.app`

---

## Atualizar o site no futuro

Sempre que fizer alterações e quiser atualizar o site:

```bash
git add .
git commit -m "Descrição da alteração"
git push
```

A Vercel faz um novo deploy automaticamente a cada `git push` na branch conectada (geralmente `main`).
