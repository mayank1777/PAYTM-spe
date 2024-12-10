pipeline {
    environment {
        backend = 'backend'  // Backend Docker image name
        frontend = 'frontend'  // Frontend Docker image name
        VAULT_PASSWORD = 'aasmaan' // Jenkins secret for the Ansible vault password
    }

    agent any

    stages {
        stage('Clone Repository') {
            steps {
                echo 'Cloning the Git repository...'
                git branch: 'master', url: 'https://github.com/Aasmaan007/paytm-spe2-.git'
            }
        }
        
        stage('Stop and Remove Containers') {
            steps {
                echo 'Stopping and removing all Docker containers...'
                script {
                    def containerIds = sh(script: "sudo docker ps -aq", returnStdout: true).trim()
                    if (containerIds) {
                        echo "Stopping and removing containers: ${containerIds}"
                        sh "sudo docker stop \$(sudo docker ps -aq)"
                        sh "sudo docker rm \$(sudo docker ps -aq)"
                    } else {
                        echo 'No containers found. Skipping stop and remove steps.'
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Docker images...'
                script {
                    backend_image = docker.build("aasmaan1/backend:latest", "./backend")
                    frontend_image = docker.build("aasmaan1/frontend:latest", "./frontend")
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                echo 'Pushing Docker images to Docker Hub...'
                script {
                    docker.withRegistry('', 'DockerHubCred') {
                        backend_image.push()
                        frontend_image.push()
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running tests for backend...'
                script {
                    dir('./backend') { // Navigate to the backend directory
                        sh 'npm install'  // Ensure dependencies are installed
                        sh 'npm test'     // Run the test script
                    }
                }
            }
        }

        stage('Deploy with Ansible') {
            steps {
                echo 'Running Ansible playbook for deployment...'
                script {
                    writeFile file: '/tmp/vault_password.txt', text: "${env.VAULT_PASSWORD}"
                }
                ansiblePlaybook(
                    playbook: 'Deployment/deploy.yml',
                    inventory: 'Deployment/inventory',
                    extras: "--vault-password-file /tmp/vault_password.txt",
                    credentialsId: 'localhost',
                    disableHostKeyChecking: true
                )
            }
        }
    }
}
