# Backup e restauração do projeto

## Fazer backup

1. Abra o **PowerShell**.
2. Vá até a pasta do projeto (uma das duas):
   ```powershell
   cd "C:\Users\user\OneDrive - Creare Sistemas\Área de Trabalho\DHC\Modulo de eventos"
   ```
   ou
   ```powershell
   cd "C:\Users\user\OneDrive - Creare Sistemas\Área de Trabalho\DHC"
   ```
3. Execute:
   ```powershell
   .\backup-projeto.ps1
   ```
   (Se estiver em "Modulo de eventos", o script sobe um nível e faz backup da pasta **DHC** inteira.)

O backup será criado na **Área de Trabalho** (ou na pasta que contém DHC), com o nome:
**DHC-backup-AAAA-MM-DD-HHmm** (data e hora).

A pasta **node_modules** não é copiada (para o backup ser mais rápido e menor). Ao restaurar, rode `npm install` dentro de "Modulo de eventos".

---

## Restaurar em caso de problema

### Opção A – Voltar a usar a pasta do backup

1. Feche o Cursor e qualquer terminal que use o projeto.
2. Na pasta onde está o **DHC** (ex.: Área de Trabalho):
   - Renomeie a pasta atual **DHC** para **DHC-quebrado** (ou outro nome).
   - Renomeie a pasta do backup **DHC-backup-AAAA-MM-DD-HHmm** para **DHC**.
3. Abra de novo a pasta **DHC** no Cursor.
4. No terminal, dentro de **Modulo de eventos**, rode:
   ```powershell
   npm install
   ```
5. Depois:
   ```powershell
   npm run dev
   ```

### Opção B – Só copiar arquivos do backup para o DHC atual

1. Abra a pasta do backup **DHC-backup-AAAA-MM-DD-HHmm**.
2. Selecione tudo (Ctrl+A), copie (Ctrl+C).
3. Abra a pasta **DHC** do projeto e **cole** (Ctrl+V), substituindo quando o Windows pedir.
4. Dentro de **Modulo de eventos**, rode **npm install** e em seguida **npm run dev**.

---

Sempre que fizer mudanças importantes, rode de novo **.\backup-projeto.ps1** para gerar um backup novo.
