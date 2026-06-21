
void shellShort(int array[], int n) {
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int temp = array[i];
            int j;
            for (j = i; j >= gap && array[j - gap] > temp; j -= gap) {
                array[j] = array[j - gap];
            }
                    array[j] = temp;
        }
    }
}

void imprimirInvetario (int array[], int n) {
    for (int i = 0; i < n; i++) {
        printf("%d ", array[i]);
    }
    printf("\n");
}

int main() {
    int inventario[] = {45,23, 78, 12, 56, 89, 67, 34};
    int n = sizeof(inventario) / sizeof(inventario[0]);
    printf("Inventário original (não ordenado):\n");
    imprimirInvetario(inventario, n);
    shellShort(inventario, n);
    printf("Inventário organizado (Shellsort):\n");
    imprimirInvetario(inventario, n);
    return 0;
}