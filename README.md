# Trabalho 2 de Programação Distribuída

Trabalho 2 de Progração Distribuída.

**Nomes:** Arthur Sudbrack Ibarra, Luiz Eduardo Mello dos Reis, Willian Magnum Albeche.

## Como Rodar

1. Baixe o [Node.js](https://nodejs.org/en/download/), é recomendado que se utilize versões ^16.15.1.

2. Baixe o [Docker](https://www.docker.com/products/docker-desktop/), essa ferramenta é **obrigatória** para o funcionamento do sistema.

3. Clone esse repositório, vá para o diretório do projeto e execute os seguinte comandos:

```sh
npm install
```

```sh
npm start
```

O comando 'npm start' irá:

1. Ler as configurações de nodos definidas em `src/configurations/nodes.json`.

2. Gerar um arquivo docker-compose com base nessas configurações para subir 1 contâiner para cada nodo.

3. Subir os contâineres Docker aplicando o docker-compose.yaml gerado.

### Por Que Preciso do Node.js em Minha Máquina?

É necessário ter o Node.js em sua máquina e não somente dentro dos contâineres porque o processo de geração do docker-compose.yaml para subir os contâineres é feito utilizando um script TypeScript, o qual só pode ser executado através do Node.js.

## Alterando as Configurações de Nodos

Modifique o arquivo `src/configurations/nodes.json` para montar a configuração de nodos que você desejar, conforme no exemplo:

```json
{
  "nodes": [
    {
      "id": "1",
      "host": "172.24.2.1",
      "port": 8000,
      "chance": 0.5,
      "events": 100,
      "min_delay": 1500,
      "max_delay": 2000
    },
    {
      "id": "2",
      "host": "172.24.2.2",
      "port": 8000,
      "chance": 0.7,
      "events": 120,
      "min_delay": 1500,
      "max_delay": 2000
    }
  ]
}
```
