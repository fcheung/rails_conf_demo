APPS = %w(container content comment)

desc "Run the migrations in all the apps" 
task :migrate_all do
  APPS.each do |app|
    Dir.chdir(app) do
      puts "migrating #{app}"
      `rake db:migrate`
    end
  end
end

desc "start all the servers"
task :start_all do
  APPS.each_with_index  do |app, index|
    Dir.chdir(app) do
      puts "starting #{app} on port #{8000 + index}"
      puts `ruby script/server -d -p #{8000 + index}`
    end
  end
end  

desc "stop all the servers"
task :stop_all do
  APPS.each_with_index  do |app, index|
    Dir.chdir(app) do
      pid = IO.read('tmp/pids/mongrel.pid')
      Process.kill 'TERM', pid.to_i
    end
  end
end  
