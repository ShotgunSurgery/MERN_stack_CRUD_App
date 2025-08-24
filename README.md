# MERN Stack CRUD Application

A full-stack product management application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and MySQL.

## Features

- **Product Management**: Create, read, update, and delete products
- **Parameter Management**: Add multiple parameters to each product with various attributes
- **Parameter Values**: Store and manage values for each parameter
- **Drag & Drop**: Reorder parameters using drag and drop functionality
- **Real-time Updates**: Immediate UI updates after database operations

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **CORS** for cross-origin requests
- **Environment variables** for configuration

### Frontend
- **React 19** with functional components and hooks
- **React Router DOM** for navigation
- **@hello-pangea/dnd** for drag and drop functionality
- **CSS** for styling

## Database Schema

### Tables
1. **products** - Main product information
2. **parameters** - Product parameters with constraints
3. **parameter_values** - Values for each parameter

### Relationships
- One-to-many: products → parameters
- One-to-many: products → parameter_values
- Cascade delete for data integrity

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Database Setup
1. Create a MySQL database
2. Run the provided SQL schema:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS mern_crud_app;
USE mern_crud_app;

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parameters table
CREATE TABLE parameters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    parameterName VARCHAR(255),
    max_value VARCHAR(50),
    min_value VARCHAR(50),
    unit VARCHAR(50),
    evaluation VARCHAR(255),
    sample_size VARCHAR(50),
    compulsory TINYINT(1) DEFAULT 0,
    status ENUM('Active','Inactive','Pending') DEFAULT 'Pending',
    CONSTRAINT fk_parameters_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Parameter values table
CREATE TABLE parameter_values (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    record_name VARCHAR(255) NOT NULL,
    parameter_name VARCHAR(255) NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_paramvalues_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=mern_crud_app
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   node server.js
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

### Products
- `GET /api/products/allProducts` - Get all products
- `POST /api/products` - Create a new product
- `PUT /api/products/:productId` - Update a product
- `DELETE /api/products/:productId` - Delete a product
- `GET /api/products/:productId` - Get product with parameters

### Parameter Values
- `GET /api/products/:productId/values` - Get parameter values
- `POST /api/products/:productId/values` - Save parameter values

### Health Checks
- `GET /api/health` - Server health check
- `GET /api/db-check` - Database connection check

## Application Flow

1. **Home Page**: View all products with options to edit, delete, or manage parameter values
2. **Create Product**: Add new products with multiple parameters
3. **Edit Product**: Modify existing products and their parameters
4. **Parameter Values**: Enter and manage values for each parameter

## Features in Detail

### Product Management
- Create products with custom names
- Add multiple parameters per product
- Edit existing products and parameters
- Delete products (with cascade deletion of related data)

### Parameter Configuration
- Parameter name, min/max values, units
- Evaluation techniques and sample sizes
- Compulsory flag and status management
- Drag and drop reordering

### Parameter Values
- Store multiple values per parameter
- Edit and update existing values
- Data persistence with proper relationships

## Error Handling

- Comprehensive error handling on both frontend and backend
- User-friendly error messages
- Database transaction rollback on errors
- Input validation and data sanitization

## Security Features

- SQL injection protection through parameterized queries
- CORS configuration for secure cross-origin requests
- Environment variable usage for sensitive data
- Input validation and sanitization

## Future Enhancements

- User authentication and authorization
- File upload for product images
- Advanced search and filtering
- Data export functionality
- Real-time notifications
- Mobile responsive design improvements

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure MySQL is running and credentials are correct
2. **CORS Errors**: Check that the backend is running on the correct port
3. **Missing Dependencies**: Run `npm install` in both frontend and backend directories

### Debug Mode
- Backend logs all database operations
- Frontend console shows API responses
- Check browser developer tools for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
