import React, { useState } from 'react';
import axios from 'axios';
import exifr from 'exifr';

const IndexPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [exifData, setExifData] = useState(null);
  const [error, setError] = useState(null);
  const [showAllExif, setShowAllExif] = useState(false);

  // Fonction pour formater les données EXIF
  const formatExifData = (exif) => {
    const formattedExif = {};
    for (const key in exif) {
      if (exif.hasOwnProperty(key)) {
        formattedExif[key] = String(exif[key]);
      }
    }
    return formattedExif;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];

        const response = await axios.post('https://b99or99807.execute-api.eu-central-1.amazonaws.com/image_properties', {
          image_bytes: base64Data
        });

        setResponseData(response.data);
        
        if (!response.data || response.data.length === 0) {
          setError("Personne n'a été reconnue, peut-être une célébrité en devenir !");
        } else {
          setError(null); // Clear error if response is not empty
        }
      };

      // Extraction des données EXIF à l'aide de exifr
      const exif = await exifr.parse(file);
      setExifData(formatExifData(exif));

    } catch (error) {
      setError(error.message);
    }
  };

  const toggleShowAllExif = () => {
    setShowAllExif(!showAllExif);
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Sélectionnez une image</h5>
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
              {/* Affichage des données EXIF */}
              {exifData && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Propriété</th>
                      <th>Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(exifData).slice(0, showAllExif ? undefined : 5).map(([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {/* Bouton "Afficher plus" */}
              {exifData && Object.entries(exifData).length > 5 && (
                <button className="btn btn-primary" onClick={toggleShowAllExif}>
                  {showAllExif ? 'Afficher moins' : 'Afficher plus'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="col-md-6">
          {/* Affichage des propriétés de l'image */}
          {responseData && responseData.ImageProperties && (
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">Propriétés de l'image</h5>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Propriété</th>
                      <th>Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(responseData.ImageProperties).map(([property, value]) => (
                      (property === 'Quality') &&
                      <tr key={property}>
                        <td>{property}</td>
                        <td>
                          Brightness: {value.Brightness.toFixed(2)}%,
                          Sharpness: {value.Sharpness.toFixed(2)}%,
                          Contrast: {value.Contrast.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Affichage des couleurs dominantes */}
          {responseData && responseData.ImageProperties.DominantColors && (
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">Couleurs dominantes</h5>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Couleur</th>
                      <th>HexCode</th>
                      <th>PixelPercent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responseData.ImageProperties.DominantColors.map((color, index) => (
                      <tr key={index}>
                        <td style={{ backgroundColor: color.HexCode }}></td>
                        <td>{color.HexCode}</td>
                        <td>{color.PixelPercent.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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

