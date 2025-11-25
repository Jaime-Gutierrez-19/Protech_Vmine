import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

export const ProductsSeller = () => {
  const { store, actions } = useContext(Context);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [image, setImage] = useState("");
  const [activeTab, setActiveTab] = useState("list-tab");
  const [categoryId, setCategoryId] = useState(0);
  const [editProduct_Id, setEditProduct_Id] = useState(0);
  const [article, setArticle] = useState({})
  const [imageArticle, setImageArticle] = useState("")
  const [articleProduct, setArticleProduct] = useState("")
  const navigate = useNavigate();

  const topics = [
    "Cómo elegir el (producto) perfecto según tus necesidades",
    "Cómo aprovechar al máximo tu (producto) en el día a día",
    "Errores comunes al usar un (producto) y cómo evitarlos",
    "Todo lo que necesitas para mantener tu (producto) en buen estado",
    "Los mejores trucos para sacar el máximo provecho de tu (producto)",
    "Consejos para prolongar la vida útil de tu (producto)",
    "Secretos para obtener el máximo rendimiento de tu (producto)",
    "Los pros y contras de invertir en un (producto)",
    "Qué esperar de un( (producto) de alta calidad",
    "Preguntas que deberías hacer antes de comprar un( (producto)",
    "Características esenciales que debes buscar en un (producto)",
    "Los accesorios imprescindibles para complementar tu (producto)",
    "Cómo cuidar y mantener en buen estado tu (producto)",
  ]

  const cloudName = "dqs1ls601";
  const presetName = "Protech";

  const getProducts = () => {
    const token = actions.verifyTokenSeller();

    if (!token) {
      console.error("No valid token found. User might need to log in.");
      navigate("/login");
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    fetch(`${process.env.BACKEND_URL}/api/products/seller`, requestOptions)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch products");
        return response.json();
      })
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error:", error));
  };

  const getCategories = () => {
    const token = actions.verifyTokenSeller();
    
    fetch(`${process.env.BACKEND_URL}/api/categorias`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Error fetching products: " + response.statusText);
				}
				return response.json();
			})
			.then((data) => {
				setCategories(data)
                
			})
			.catch((error) => {
				console.error("Error fetching cart items:", error);
			});
  };

  const cleanFields = () => {
    setName("");
    setDescription("");
    setPrice(0);
    setStock(0);
    setImage("");
    setCategoryId(0);
  };

  const handleSubmitCreate = (e) => {
    e.preventDefault();
    const raw = JSON.stringify({
      name,
      description,
      price: parseInt(price),
      stock: parseInt(stock),
      image,
      category_id: categoryId
    });

    const token = actions.verifyTokenSeller();

    if (!token) {
      console.error("No valid token found. User might need to log in.");
      return;
    }

    fetch(`${process.env.BACKEND_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: raw
    })
      .then(() => {
        getProducts();
        setActiveTab("list-tab");
        cleanFields();
      })
      .catch((error) => console.error("Error creating product:", error));
  };

  const getToEdit = (product_id) => {
    fetch(`${process.env.BACKEND_URL}/api/products/${product_id}`, { method: "GET" })
      .then((response) => response.json())
      .then((data) => {
        setActiveTab("edit-tab");
        setName(data.name);
        setDescription(data.description);
        setPrice(data.price);
        setStock(data.stock);
        setImage(data.image);
        setEditProduct_Id(product_id);
        setCategoryId(data.category.id);
      });
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    const raw = JSON.stringify({
      name,
      description,
      price: parseInt(price),
      stock: parseInt(stock),
      image,
      category_id: categoryId
    });

    fetch(`${process.env.BACKEND_URL}/api/products/${editProduct_Id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: raw
    })
      .then(() => {
        getProducts();
        cleanFields();
        setActiveTab("list-tab");
      })
      .catch((error) => console.error(error));
  };

  const viewMore = (product_id) => {
    fetch(`${process.env.BACKEND_URL}/api/products/${product_id}`, { method: "GET" })
      .then((response) => response.json())
      .then((data) => {
        setActiveTab("view-more-tab");
        setName(data.name);
        setDescription(data.description);
        setPrice(data.price);
        setStock(data.stock);
        setImage(data.image);
        setCategoryId(data.category.id);
      });
  };

  const deleteProduct = (product_id) => {
    fetch(`${process.env.BACKEND_URL}/api/products/${product_id}`, { method: "DELETE" })
      .then((response) => {
        if (response.ok) {
          getProducts();
        } else {
          console.error("Error deleting product:", response.statusText);
        }
      })
      .catch((error) => console.error("Network error:", error));
  };

  const updateProductImageInDB = async (productId, imageUrl) => {
    const token = actions.verifyTokenSeller();
    if (!token) {
      console.error("No valid token found. User might need to log in.");
      return;
    }

    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/products/${productId}/update-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ image_url: imageUrl })
      });

      if (!response.ok) {
        throw new Error("Failed to update product image in the database");
      }

      const data = await response.json();
    } catch (error) {
      console.error("Error updating product image in DB:", error);
    }
  };
const handleFileChange = async (e, productId) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", presetName);
    
        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: formData
            });
    
            const data = await response.json();
            const imageUrl = data.secure_url;

            

            await modifyProductImage(productId, imageUrl);
            
            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product.id === productId ? { ...product, image: imageUrl } : product
                )
            );
    
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    const modifyProductImage = async (productId, imageUrl) => {
        const token = actions.verifyTokenSeller(); 
        if (!token) {
            console.error("No valid token found. User might need to log in.");
            return;
        }
    
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/products/image/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ image: imageUrl })
            });
    
            if (!response.ok) {
                throw new Error("Failed to modify product image");
            }
    
            const data = await response.json();
        } catch (error) {
            console.error("Error modifying product image:", error);
        }
    };


  useEffect(() => {
    const token = actions.verifyTokenSeller();
    if (!token) {
      navigate("/login");
    } else {
      getProducts();
      getCategories();
    }
  }, []);

  const cleanFieldsArticle = () => {
    setArticle({})
    setImageArticle("")
  }

  async function generateArticle(productName) {
    setArticleProduct(productName)
    const topic = topics[Math.floor(Math.random() * topics.length)];

    const apiKeyChatGPT = process.env.OPEN_AI_API_KEY;
    const endpointChatGPT = 'https://api.openai.com/v1/chat/completions';

    const prompt = `Escribe un artículo de 900 caracteres en formato JSON sobre el siguiente tema: "${topic}". El producto es: "${productName}". El JSON debe tener dos campos:
      - 'title' para el título del artículo,
      - 'content' para el cuerpo completo del artículo. 
    Asegúrate de que el JSON esté bien formado, sin ningún formato adicional, sin comillas invertidas o markdown, ni usar saltos de linea como "\n", y que sea válido para ser procesado directamente como JSON.`;

    try {
      const response = await fetch(endpointChatGPT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeyChatGPT}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: "system", content: "Eres un asistente que escribe artículos informativos y atractivos sobre productos para un sitio de marketplace." },
            { role: 'user', content: prompt }
          ],
          max_tokens: 400, 
        })
      });

      const data = await response.json();

      let content = data.choices[0].message.content;
      content = content.replace(/\\n/g, ''); 
      content = content.replace(/`/g, '');
      
      const dataArticle = JSON.parse(content)
      
      setArticle(dataArticle);

    } catch (error) {
      console.error('Error generando el artículo:', error);
    }

    const apiKeySearch = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_CX_ID;
    const endpointSearch = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(productName)}&cx=${cx}&searchType=image&key=${apiKeySearch}&num=1&imgType=photo`;

    try {
      const response = await fetch(endpointSearch);
      if (!response.ok) throw new Error('Error al obtener la imagen');
      const data = await response.json();
      setImageArticle(data.items[0]?.link || "https://example.com/default-image.jpg"); 
    } catch (error) {
      console.error('Error obteniendo imagen:', error);
      setImageArticle("https://example.com/default-image.jpg")
    }
  }

  const publishArticle = () => {
    
    const raw = {
      title: article.title, 
      image: imageArticle,
      content: article.content
    };

    fetch(`${process.env.BACKEND_URL}/api/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(raw)  
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al publicar el artículo");
        }
        return response.json();
    })
    .then(() => {
        cleanFieldsArticle();  
    })
    .catch(error => {
        console.error("Error:", error);
    });
  }

  return (
    <div className="container mt-5">
      <h2 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", marginBottom: "20px" }}>
        My Products
      </h2>

      <ul className="nav nav-tabs" id="myTab" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "list-tab" ? "active" : ""}`}
            id="list-tab"
            data-bs-toggle="tab"
            data-bs-target="#list-tab-pane"
            type="button"
            role="tab"
            aria-controls="list-tab-pane"
            aria-selected={activeTab === "list-tab"}
            onClick={() => setActiveTab("list-tab")}
          >
            List
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "edit-tab" ? "active" : "d-none"}`}
            id="edit-tab"
            data-bs-toggle="tab"
            data-bs-target="#edit-tab-pane"
            type="button"
            role="tab"
            aria-selected={activeTab === "edit-tab"}
          >
            Edit
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "view-more-tab" ? "active" : "d-none"}`}
            id="view-more-tab"
            data-bs-toggle="tab"
            data-bs-target="#view-more-tab-pane"
            type="button"
            role="tab"
            aria-selected={activeTab === "view-more-tab"}
          >
            View More
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "create-tab" ? "active" : ""}`}
            id="create-tab"
            data-bs-toggle="tab"
            data-bs-target="#create-tab-pane"
            type="button"
            role="tab"
            aria-controls="create-tab-pane"
            aria-selected={activeTab === "create-tab"}
            onClick={() => {
              setActiveTab("create-tab");
              cleanFields();
            }}
          >
            Create
          </button>
        </li>
      </ul>

      <div className="tab-content" id="myTabContent">
        <div className={`tab-pane fade ${activeTab === "create-tab" ? "show active" : ""}`} id="create-tab-pane" role="tabpanel" aria-labelledby="create-tab" tabIndex="0">
          <form className="mt-4 ms-5" onSubmit={handleSubmitCreate}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-control" id="name" />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="form-control" id="description" />
            </div>
            <div className="mb-3">
              <label htmlFor="price" className="form-label">Price</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="form-control" id="price" />
            </div>
            <div className="mb-3">
              <label htmlFor="stock" className="form-label">Stock</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="form-control" id="stock" />
            </div>
            <div className="mb-3">
            <label htmlFor="image" className="form-label">Image</label>
            <input type="file" onChange={(e) => handleFileChange(e, 0)} className="form-control" id="image" />
          </div>
            <div className="mb-3">
              <label htmlFor="category" className="form-label">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="form-select" id="category">
                <option value="0">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Create Product</button>
          </form>
        </div>

        <div className={`tab-pane fade ${activeTab === "edit-tab" ? "show active" : ""}`} id="edit-tab-pane" role="tabpanel" aria-labelledby="edit-tab" tabIndex="0">
          <form className="mt-4 ms-5" onSubmit={handleSubmitEdit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-control" id="name" />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="form-control" id="description" />
            </div>
            <div className="mb-3">
              <label htmlFor="price" className="form-label">Price</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="form-control" id="price" />
            </div>
            <div className="mb-3">
              <label htmlFor="stock" className="form-label">Stock</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="form-control" id="stock" />
            </div>
            <div className="mb-3">
              <label htmlFor="image" className="form-label">Image URL</label>
              <td>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => handleFileChange(e, product.id)}
  />
</td>
            </div>
            <div className="mb-3">
              <label htmlFor="category" className="form-label">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="form-select" id="category">
                <option value="0">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Edit Product</button>
          </form>
        </div>

        <div className={`tab-pane fade ${activeTab === "view-more-tab" ? "show active" : ""}`} id="view-more-tab-pane" role="tabpanel" aria-labelledby="view-more-tab" tabIndex="0">
          <div className="mt-4 ms-5">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.description}</td>
                    <td>{product.price}</td>
                    <td>{product.stock}</td>
                    <td>
                      <img
                        src={product.image || "https://res.cloudinary.com/dqs1ls601/image/upload/v1731206219/vbxdwt1xqinu1ffd82mm.jpg"}
                        alt={product.name}
                        style={{ width: "100px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, product.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`tab-pane fade ${activeTab === "list-tab" ? "show active" : ""}`} id="list-tab-pane" role="tabpanel" aria-labelledby="list-tab" tabIndex="0">
          {products.length > 0 ? (
            <>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Actions</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Image</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td className="text-center">
                        <i className="fa-solid fa-newspaper me-3" type="button"  data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={()=>generateArticle(product.name)}></i>
                        <i className="fas fa-edit me-3" style={{ cursor: "pointer" }} onClick={() => getToEdit(product.id)}></i>
                        <i className="fas fa-trash me-3" style={{ cursor: "pointer" }} onClick={() => deleteProduct(product.id)}></i>
                        <i className="fas fa-eye" style={{ cursor: "pointer" }} onClick={() => viewMore(product.id)}></i>
                      </td>
                      <td>{product.name}</td>
                      <td>{product.description}</td>
                      <td>{product.price}</td>
                      <td>{product.stock}</td>
                      <td>
                        <img
                          src={product.image || "https://res.cloudinary.com/dqs1ls601/image/upload/v1731206219/vbxdwt1xqinu1ffd82mm.jpg"}
                          alt={product.name}
                          style={{ width: "100px" }}
                        />
                      </td>
                      <td>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, product.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="modal fade" id="exampleModal" tabIndex="-1" data-bs-backdrop="static" data-bs-keyboard="false" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h1 className="modal-title fs-5" id="exampleModalLabel">Article</h1>
                      <button type="button" onClick={() => cleanFieldsArticle()} className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <div>
                        <div>
                          <h2>{article.title}</h2>
                        </div>
                        <div style={{width: "100%", height: "500px"}}>
                          <img src={imageArticle} style={{width: "100%", height: "100%", objectFit: "contain"}}/>
                        </div>
                        <div>
                          <p>{article.content}</p>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" onClick={() => cleanFieldsArticle()} className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                      <button type="button" className="btn btn-primary" onClick={()=> publishArticle()} data-bs-dismiss="modal">Save</button>
                      <button type="button" onClick={() => generateArticle(articleProduct)} className="btn btn-primary">regenerate</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p>No products found for this seller.</p>
          )}
        </div>
      </div>
    </div>
  );
};
