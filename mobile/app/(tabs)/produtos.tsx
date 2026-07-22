import Layout from '@/components/ui/Layout'
import { api } from '@/services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useAuth } from '@/hooks/useAuth'

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  quantity: number
}

interface Category {
  id: number
  name: string
  products: Product[]
}

type ItemCardProps = {
  item: Product
  isEven: boolean
  quantity: number
  onIncrease: (item: Product) => void
  onDecrease: (id: number) => void
}

function ItemCard({ item, isEven, quantity, onIncrease, onDecrease }: ItemCardProps) {
  return (
    <View style={[styles.product, isEven ? styles.productEven : styles.productOdd]}>
      <View style={styles.productImage}>
        <Image source={{ uri: item.image }} style={styles.productImageIn} />
      </View>

      <View style={styles.productInfo}>
        <View style={styles.productInfoOne}>
          <Text style={styles.productName}>{item.name}</Text>

          <Text style={styles.productDescription}>{item.description}</Text>
        </View>

        <View style={styles.productInfoTwo}>
          <Text style={styles.productPrice}>R${Number(item.price).toFixed(2)}</Text>

          <View style={styles.productCart}>
            <TouchableOpacity
              style={[styles.productButtonLess, isEven ? styles.productButtonLessEven : styles.productButtonLessOdd]}
              onPress={() => onDecrease(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={`Diminuir quantidade de ${item.name}`}
            >
              <Text style={styles.productButtonLessText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.productCartNumber}>{quantity}</Text>

            <TouchableOpacity
              style={[styles.productButtonPlus, isEven ? styles.productButtonPlusEven : styles.productButtonPlusOdd]}
              onPress={() => onIncrease(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={`Aumentar quantidade de ${item.name}`}
            >
              <Text style={styles.productButtonPlusText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

export default function Produtos() {

  const { token, isAuthenticated, isLoading } = useAuth()

  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])

  const [quantities, setQuantities] = useState<Record<number, number>>({})

  const [showCheckout, setShowCheckout] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const total = Object.values(quantities).reduce((acc, qty) => acc + qty, 0)
    setShowCheckout(total > 0)
  }, [quantities])

  useEffect(() => {

    const fetchCategories = async () => {

      if (!token) return

      try {
        const { ok, data } = await api<Category[]>('/menu')

        if (ok) {
          setCategories(data)
        }
        else {
          console.error('Erro ao buscar cardápio:', data)
        }
      }
      catch (error) {
        console.error('Erro ao conectar com o servidor:', error)
      }
    }

    fetchCategories()
  }, [token])

  const handleCreateOrder = async () => {

    try {

      const selectedProducts = Object
        .entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([id, quantity]) => {
          const product = categories.flatMap(c => c.products).find(p => p.id === Number(id))
          return {
            id: product?.id,
            name: product?.name,
            description: product?.description,
            quantity,
            price: product?.price,
            stock: product?.quantity
          }
        })

      await AsyncStorage.setItem('@pedido', JSON.stringify(selectedProducts))

      router.push('/carrinho')
    }
    catch {
      Alert.alert('Erro', 'Não foi possível salvar o pedido.')
    }
  }

  const increaseQuantity = (item: Product) => {

    const currentQuantity = quantities[item.id] || 0

    if (currentQuantity < item.quantity) {
      setQuantities(prev => ({
        ...prev,
        [item.id]: currentQuantity + 1
      }))
    }
    else {
      Alert.alert('Estoque esgotado', `A quantidade máxima para ${item.name} já foi selecionada.`)
    }
  }

  const decreaseQuantity = (itemId: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) - 1)
    }))
  }

  return (
    <Layout>
      <View style={styles.products}>
        {
          categories.map((category) => (
            <View key={category.id}>
              <Text style={styles.productsTitle}>{category.name}</Text>
              {
                category.products.map((item, index) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    isEven={index % 2 === 0}
                    quantity={quantities[item.id] || 0}
                    onIncrease={increaseQuantity}
                    onDecrease={decreaseQuantity}
                  />
                ))
              }
            </View>
          ))
        }
      </View>

      {
        showCheckout && (
          <TouchableOpacity
            onPress={handleCreateOrder}
            style={styles.modalButton}
            accessibilityRole="button"
            accessibilityLabel="Finalizar pedido"
          >
            <Text style={styles.modalButtonText}>FINALIZAR PEDIDO</Text>
          </TouchableOpacity>
        )
      }
    </Layout>
  )
}

const screenWidth = Dimensions.get('window').width

const screenHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
  products: {
    flexGrow: 1
  },
  productsTitle: {
    fontFamily: 'Fraunces',
    fontSize: 24,
    textAlign: 'center',
    paddingVertical: 40
  },
  productsList: {
    flex: 1,
  },
  product: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
    height: 110
  },  
  productEven: {
    backgroundColor: 'rgba(50, 152, 77, .1)'
  },
  productOdd: {
    backgroundColor: 'rgba(50, 152, 77, .22)'
  },
  productImage: {
    width: 110,
    height: 110,
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#FFF'
  },
  productImageIn: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    padding: 10
  },
  productInfo: {
    width: screenWidth - 110,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5,
    padding: 15,
  },
  productInfoOne: {
    width: '70%',
    flex: 1,
  },
  productInfoTwo: {
    width: '30%',
    flexDirection: 'column',
  },
  productName: {
    fontFamily: 'Fraunces',
    fontSize: 16,
    lineHeight: 20,
  },
  productPrice: {
    fontFamily: 'ElmsSans',
    fontSize: 16,
    textAlign: 'right',
  },
  productDescription: {
    fontFamily: 'ElmsSans',
    fontSize: 10,
    lineHeight: 11
  },
  productCart: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
    marginRight: 15,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  productCartNumber: {
    fontFamily: 'ElmsSans',
    fontSize: 13,
    lineHeight: 13
  },
  productButtonLess: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  productButtonLessEven: {
    borderColor: 'rgba(50, 152, 77, .4)'
  },
  productButtonLessOdd: {
    borderColor: 'rgba(50, 152, 77, 1)'
  },
  productButtonLessText: {
    fontFamily: 'ElmsSans',
    fontSize: 13,
    lineHeight: 13,
  },
  productButtonPlus: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  productButtonPlusEven: {
    borderColor: 'rgba(50, 152, 77, .4)'
  },
  productButtonPlusOdd: {
    borderColor: 'rgba(50, 152, 77, 1)'
  },
  productButtonPlusText: {
    fontFamily: 'ElmsSans',
    fontSize: 13,
    lineHeight: 13,
  },
  modalButton: {
    position: 'absolute',
    top: screenHeight - 192,
    left: '50%',
    transform: [{ translateX: -0.5 * 250 }],
    width: 250,    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#32984D',
  },
  modalButtonText: {
    fontFamily: 'ElmsSans-SemiBold',
    fontSize: 14,
    color: '#FFF',
  },
})