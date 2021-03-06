// Objeto que contém 2 funções(métodos) que abrem e fecham o modal
const Modal = {
  Open() {
    // Abrir modal
    // Adicionar a class active ao modal
    document.querySelector('.modal-overlay').classList.add('active')
  },
  Close() {
    // Fechar o modal
    // Remover a class active do modal
    document.querySelector('.modal-overlay').classList.remove('active')
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("e-wallet:transactions")) || []
  },
  set(transactions) {
    localStorage.setItem("e-wallet:transactions", JSON.stringify(transactions))
  }
}

const Transaction = {

  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)
    App.reload()
  },
  remove(index) {
    Transaction.all.splice(index, 1)

    App.reload()
  },
  incomes() {
    // Pegar todas as transações
    // Para cada transação, se for maior que zero
    // Somar a uma variável e retornar a variável
    let income = 0
    Transaction.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income = income + transaction.amount
      }
    })

    return income
  },
  expenses() {
    // Pegar todas as transações
    // Para cada transação, se for menor que zero
    // Somar a uma variavel e retornar a variavel
    let expense = 0
    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense = expense + transaction.amount
      }
    })

    return expense
  },
  total() {
    // Pegar todas as transações
    // E calcular o total
    // Total = Entradas - Saídas
    return Transaction.incomes() + Transaction.expenses()
  }
}

// Substituir os dados do HTML com os dados do JS
const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction)
    tr.dataset.index = index
    DOM.transactionsContainer.appendChild(tr)

  },
  
  innerHTMLTransaction(transaction, index) {
    
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense'
    
    const amount = Utils.formatCurrency(transaction.amount)
    

    const html = `
      <tr>
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
          <i onclick="Transaction.remove(${index})"class="fa-solid fa-trash"></i>
        </td>
      </tr>
    `

    return html
  },

  updateBalance() {
    document.getElementById('incomeDisplay')
    .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document.getElementById('expenseDisplay')
    .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document.getElementById('totalDisplay')
    .innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ""
  }

}
// Formatar os valores(transações) de entrada e saída
const Utils = {
  
  formatAmount(value) {
    value = Number(value.replace(/\,\./g, "")) * 100
    return value
  },

  formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""

    value = String(value).replace(/\D/g, "")
    value = Number(value) / 100
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal + value

  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },

  validateFields() {
    // Verificar se todas as informçaões foram preenchidas
    const {description, amount, date} = Form.getValues()

    if (
      description.trim() === "" || 
      amount.trim() === "" || 
      date.trim() === "") {
        throw new Error("Por favor, preencha todos os campos")
      }
  },

  formatValues() {
    // Formatar os dados para salvar
    let {description, amount, date} = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }

  },

  saveTransation(transaction) {
    // Salvar
    Transaction.add(transaction)
  },

  clearFields() {
    // Apagar os dados do formulário
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault()

    try {
      Form.validateFields() // Verifica se os campos são válidos
      const transaction = Form.formatValues() // Formatar transação
      Transaction.add(transaction) // Adiciona uma nova transação
      Form.clearFields() // Limpa os campos
      Modal.Close() // Fecha o modal

    } catch (error) {
        window.alert(error.message)
    }
    
  }
}

const App = {
  init() {
    
    Transaction.all.forEach(DOM.addTransaction)
    
    DOM.updateBalance()

    Storage.set(Transaction.all)
  },
  reload() {
    // Atualizar a aplicação
    DOM.clearTransactions()
    App.init()
  }
}

App.init()

