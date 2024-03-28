import React, { useState } from 'react';
import axios from 'axios';

const IndexPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];

        const response = await axios.post('https://u35wu41ksa.execute-api.eu-central-1.amazonaws.com/image-content', {
          image_bytes: base64Data
        }, {
  mode: 'no-cors'
});

        setResponseData(response.data);
        
        if (!response.data || response.data.length === 0) {
          setError("Personne n'a été reconnue, peut-être une célébrité en devenir !");
        } else {
          setError(null); // Clear error if response is not empty
        }
      };

    } catch (error) {
      setError(error.message);
    }
  };
let labelNames = [];
if (responseData && responseData.Labels) {
  // Parcourir chaque objet dans le tableau "Labels"
  responseData.Labels.forEach(label => {
    // Vérifier si la clé "Name" est présente dans chaque objet
    if (label.Name) {
      // Ajouter le nom à la liste labelNames
      labelNames.push(label.Name);
    }
  });
}
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Select a picture</h5>
              <input
                type="file"
                className="form-control mb-3"
                id="inputImage"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Affichage de l'image sélectionnée */}
          {imagePreview && (
            <div className="card mb-3">
              <img src={imagePreview} className="card-img-top" alt="Image Preview" style={{ maxWidth: '100%' }} />
            </div>
          )}
        </div>

        <div className="col-md-6">
          <div>
  <h2>Here's what the image shows :</h2>
  <ul>
    {labelNames.map((name, index) => (
      <li key={index}>{name}</li>
    ))}
  </ul>
</div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndexPage;

