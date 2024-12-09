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
                    // Get all container IDs (running or stopped)
                    def containerIds = sh(script: "sudo docker ps -aq", returnStdout: true).trim()
            
                    // Only stop and remove containers if there are any
                    if (containerIds) {
                        echo "Stopping and removing containers: ${containerIds}"
                        sh "sudo docker stop \$(sudo docker ps -aq)"  // Stop all containers (escaped $)
                        sh "sudo docker rm \$(sudo docker ps -aq)"    // Remove all containers (escaped $)
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
                    // Build Backend Docker Image
                    backend_image = docker.build("aasmaan1/backend:latest", "./backend")
                    
                    // Build Frontend Docker Image
                    frontend_image = docker.build("aasmaan1/frontend:latest", "./frontend")
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                echo 'Pushing Docker images to Docker Hub...'
                script {
                    // Push Backend Docker Image to Docker Hub
                    docker.withRegistry('', 'DockerHubCred') {
                        backend_image.push()
                    }

                    // Push Frontend Docker Image to Docker Hub
                    docker.withRegistry('', 'DockerHubCred') {
                        frontend_image.push()
                    }
                }
            }
        }

        


        stage('Deploy with Ansible') {
            steps {
                echo 'Running Ansible playbook for deployment...'
                script {
                    // Create temporary file for vault password
                    writeFile file: '/tmp/vault_password.txt', text: "${env.VAULT_PASSWORD}"
                }
                ansiblePlaybook(
                    playbook: 'Deployment/deploy.yml',
                    inventory: 'Deployment/inventory',
                    extras: "--vault-password-file /tmp/vault_password.txt",  // Use the temporary password file
                    credentialsId: 'localhost',
                    disableHostKeyChecking: true
                )
            }
        }
    }
}
