const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			demo: [
				{
					title: "FIRST",
					background: "white",
					initial: "white"
				},
				{
					title: "SECOND",
					background: "white",
					initial: "white"
				}
			],
			authenticatedBuyer: false,
			authenticatedSeller:false,
			sellerId: null,
			selectedProduct: {} ,
			amounts: {},
			cart: {},
			search: "",
		},
		actions: {
			verifyTokenBuyer: () => {
				const token = localStorage.getItem('jwt-token-buyer');

				if(token != null){
					setStore({ authenticatedBuyer: true })
					return(token)
				}
			},
			changeAuthenticatedBuyer: (bool) => {
				setStore({authenticatedBuyer: bool})
			},
			verifyTokenSeller: () => {
				const token = localStorage.getItem('jwt-token-seller');
				
				
				if (token != null) {
					setStore({ authenticatedSeller: true });
					return(token)
				}
			},
			
			changeAuthenticatedSeller: (bool) => {
				setStore({authenticatedSeller: bool})
			},

			getCart: async () => {
				const token = localStorage.getItem("jwt-token-buyer");
				try {
					const response = await fetch(process.env.BACKEND_URL + "/api/buyer/cart/products", {
						headers: { Authorization: `Bearer ${token}` }
					});
					const data = await (response.ok ? response.json() : Promise.reject(response.statusText));
		
					return setStore({ 
						cart: data,
						items: data.items,
						total_price: data.total_price
					});
				} catch (error) {
					return console.error("Error fetching cart items:", error);
				}
			},

			updateCartItemAmount: (itemId, newAmount) => {
				const store = getStore();
			
				const updatedItems = store.cart.items.map(item => {
					if (item.item_id === itemId) {
						return { ...item, amount: newAmount };
					}
					return item;
				});
			
				const total_price = updatedItems.reduce((acc, item) => acc + (item.product.price * item.amount), 0);
			
				setStore({
					cart: {
						...store.cart,
						items: updatedItems,
						total_price: total_price
					}
				});
			
				const token = localStorage.getItem("jwt-token-buyer");
				fetch(`${process.env.BACKEND_URL}/api/buyer/cart/products/${itemId}`, {
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ 
						amount: newAmount,
						total_price: total_price 
					}),
				})
				.then((response) => {
					if (!response.ok) {
						throw new Error("Error updating item quantity: " + response.statusText);
					}
					return response.json();
				})
				.then((result) => {
				})
				.catch((error) => {
					console.error("Error updating item quantity:", error);
				});
			},
			
			setSearch: (searchTerm) => {
				setStore({search: searchTerm});
			},

			addToCart: (productId,amountProduct) => {
				const token = getActions().verifyTokenBuyer()
		
				const raw = JSON.stringify({
					"amount": amountProduct || 1,
					"product_id": parseInt(productId)
				});
		
				const requestOptions = {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`,
					},
					body: raw,
					redirect: "follow"
				};
		
				fetch(process.env.BACKEND_URL + "/api/itemscarts", requestOptions)
					.then((response) => {
						if (response.status === 401) {
							alert("you have to log in or sign in");
						}
						if (!response.ok) {
							return response.json().then(err => { throw err; });
						}
						return response.json();
					})
					.then(() => {
						getActions().getCart();
					})
			},

			getMessage: async () => {
				try{
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/hello")
					const data = await resp.json()
					setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return data;
				}catch(error){
					console.log("Error loading message from backend", error)
				}
			},
			changeColor: (index, color) => {
				//get the store
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});

				//reset the global store
				setStore({ demo: demo });
			}
		}
	};
};

export default getState;
