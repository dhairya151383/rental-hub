# RentalHub - Apartment Rental Platform

This project is a web-based application developed with Angular that serves as a comprehensive platform for apartment rentals. It enables landlords and property managers to post available apartments, and prospective renters to express interest and engage in discussions.

## Table of Contents

1.  [Project Description](#project-description)
2.  [Features](#features)
3.  [Deliverables](#deliverables)
4.  [Setup and Installation](#setup-and-installation)
5.  [Running the Application](#running-the-application)
6.  [Deployed Application](#deployed-application)
7.  [User Credentials](#user-credentials)
8.  [Unit Tests](#unit-tests)
9.  [Bonus Features](#bonus-features)
10. [UI/UX Enhancements](#uiux-enhancements)
11. [Evaluation Criteria](#evaluation-criteria)

## 1. Project Description

In today's fast-paced world, finding and renting an apartment can be a complex and time-consuming process. This application aims to provide a seamless, user-friendly platform to connect prospective renters with landlords and property managers efficiently.

## 2. Features

Following features are implemented or partially implemented:

* **User Registration and Authentication:**
    * Secure user accounts with registration and login functionalities.
    * `AuthService` handles `createUserWithEmailAndPassword` and `signInWithEmailAndPassword`.
    * `AuthGuard` protects routes, ensuring only authorized users can access certain sections.
    * `RoleGuard` restricts access to specific routes based on user roles (e.g., 'admin' for posting apartments).
* **Apartment Listings:**
    * A system for creating, updating, and managing apartment listings.
    * `PostApartmentComponent` provides a form for creating new listings with various details (property location, details, rent, amenities, contact info, images).
    * `ApartmentListingsComponent` displays all available apartments, including a carousel for favorites.
    * `ApartmentDetailComponent` shows detailed information for a selected apartment.
* **Show Interest (Favorites):**
    * Prospective renters can express interest by marking listings as favorites.
    * `markAsFavorite` function in `ApartmentListingsComponent` updates the `isFavorite` status via `ApartmentService`.
* **Comment and Reply System:**
    * An interactive comment section for each listing.
    * `CommentService` handles adding comments and fetching top-level comments and replies from Firestore.
    * `ApartmentCommentsComponent` integrates the commenting functionality within the apartment detail view.
* **Image Upload:**
    * Integration with Cloudinary for image uploads.
    * `CloudinaryService` handles the upload process.
    * `UploadImageComponent` provides a reusable component for image selection and preview.
* **Routing Implementation:**
    * `AppRoutingModule` defines core routes for login, register, and dashboard.
    * `ApartmentRoutingModule` handles feature-specific routing for apartment listings, posting, and details.
    * Lazy loading is implemented for the `ApartmentModule`.
* **Form Validation:**
    * Implemented using Angular's `ReactiveFormsModule` 
    * Custom validator for password matching in `RegisterComponent`.
* **Firebase Integration:**
    * Uses `@angular/fire` for Firebase Authentication and Firestore.
    * `environment.production.ts` contains Firebase configuration.
* **Navigation:**
    * `NavbarComponent` provides navigation, breadcrumbs, and a "Post Apartment" button (visible to admins).
    * `NavService` manages breadcrumb and post button visibility state.

## 3. Deliverables

* A fully functional web application meeting the specified requirements.
* GitHub link where code is kept (without node modules).
    * **Link:** [https://github.com/dhairya151383/rental-hub.git]
* Link for deployed application. (Note: Deploy the frontend application on any free hosting providers).
    * **Link:** [https://rentalhub-ba7d0.firebaseapp.com]

## 4. Setup and Installation

To set up the project locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/dhairya151383/rental-hub.git]
    cd rentalhub
    ```
2.  **Install Node.js and npm:**

    Ensure you have Node.js (LTS version recommended) and npm installed. You can download them from [nodejs.org](https://nodejs.org/).
3.  **Install Angular CLI:**

    Update your Angular CLI to the latest version:

    ```bash
    npm install -g @angular/cli@latest
    ```
4.  **Install dependencies:**

    Navigate to the project directory and install the necessary npm packages:

    ```bash
    npm install
    ```
5.  **Firebase Configuration:**

    Ensure your Firebase project configuration is correctly set in `src/environments/environment.production.ts` (and `environment.ts` for development if applicable). The provided `rentalhub.txt` shows:

    ```typescript
    export const environment = {
      production: true,
      firebaseConfig: {
        apiKey: "***",
        authDomain: "***",
        projectId: "***",
        storageBucket: "***",
        messagingSenderId: "***",
        appId: "***",
        measurementId: "***"
      },
      cloudName: '***',
      uploadPreset: '***',
      defaultApartmentImage: 'assets/images/default-apartment.png'
    };
    ```
## 5. Running the Application

To run the application locally:

1.  **Start the development server:**

    ```bash
    ng serve
    ```
2.  Open your browser and navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## 6. Deployed Application

* **Link:** [https://rentalhub-ba7d0.firebaseapp.com]

## 7. User Credentials

Please use the following credentials to test the application:

* **Admin User:**
    * **Email:** [admin@nagarro.com]
    * **Password:** [Nagarro@@1234]
* **Regular User:**
    * **Email:** [tenant@nagarro.com]
    * **Password:** [Nagarro@@1234]

**Note:** You can register new users with 'user' or 'admin' roles from the registration page.

## 8. Bonus Features

* **Implement Preview and Submit Screen for post:**
    * **Status:** Partially Implemented. The `PostApartmentComponent` has an `onPreview()` method that navigates to the `ApartmentDetailComponent` with the form data, effectively showing a preview. The `ApartmentDetailComponent` can receive `apartmentData` via router state for preview purposes.

## 9. UI/UX Enhancements

Creative thinking has been applied to enhance the UI interface and functionality of the platform, including:

* **Intuitive and Responsive Design:** The application utilizes Angular Material components and custom CSS with media queries (`navbar.component.css`, `apartment-detail.component.css`, `apartment-listings.component.css`) to ensure a responsive and user-friendly experience across various devices.
* **Consistent Styling:** A consistent visual theme is maintained throughout the application with clear typography and color schemes.
* **Interactive Elements:** Buttons and interactive elements are clearly styled for better user feedback.
* **Image Carousel:** The apartment detail page features an image carousel for better presentation of property photos.
* **Favorites Carousel:** A dedicated carousel for favorite listings on the dashboard provides quick access to preferred properties.
* **Dynamic Navigation:** Breadcrumbs in the navbar dynamically update based on the current route.
