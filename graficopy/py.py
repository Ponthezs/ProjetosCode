import matplotlib.pyplot as plt
import numpy as np
from sklearn.linear_model import LinearRegression

# Dados das idades
idades = [36, 55, 47, 43, 34, 29, 44, 41, 21, 28,
          56, 42, 59, 48, 41, 38, 54, 23, 40, 26,
          27, 57, 53, 38, 46, 27, 40, 24, 48, 41,
          50, 21, 58, 59, 55, 56, 60, 41, 51, 40,
          57, 33, 26, 31, 36, 36, 36, 36, 28, 35,
          46, 52, 24, 33, 27, 30, 50, 23, 40, 22,
          42, 29, 46, 50, 38, 51, 27, 36, 39, 22,
          34, 26, 30, 40, 41]

# Pontos médios dos intervalos de idade e suas frequências
x = np.array([22.5, 27.5, 32.5, 37.5, 42.5, 47.5, 52.5, 57.5, 62.5]).reshape(-1, 1)
y = np.array([8, 11, 9, 14, 11, 7, 10, 12, 3]).reshape(-1, 1)

# Ajustar modelo de regressão linear
model = LinearRegression()
model.fit(x, y)
m = model.coef_[0][0]
b = model.intercept_[0]

# Gerar gráfico de frequências com a reta de ajuste
plt.hist(idades, bins=range(20, 70, 5), edgecolor='black', alpha=0.7, label='Frequência')
plt.plot(np.linspace(20, 65, 100), m * np.linspace(20, 65, 100) + b, color='red', label='Reta de Ajuste')
plt.title('Distribuição de Idades dos Clientes com Reta de Ajuste')
plt.xlabel('Idades')
plt.ylabel('Frequência')
plt.legend()
plt.grid(axis='y')
plt.show()
